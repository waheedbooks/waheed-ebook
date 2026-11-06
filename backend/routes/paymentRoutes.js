const crypto = require("crypto");
const express = require("express");
const Book = require("../models/Book");
const Purchase = require("../models/Purchase");
const { protect } = require("../middleware/auth");

const SAFEPAY_ENV = ["production", "live", "prod"].includes(
  String(process.env.SAFEPAY_ENVIRONMENT || "sandbox").toLowerCase()
)
  ? "production"
  : "sandbox";

const SAFEPAY_HOST =
  SAFEPAY_ENV === "production"
    ? "https://api.getsafepay.com"
    : "https://sandbox.api.getsafepay.com";

let safepayClient = null;
function getSafepay() {
  if (safepayClient) return safepayClient;
  if (!process.env.SAFEPAY_SECRET_KEY) {
    throw new Error("SAFEPAY_SECRET_KEY is not set");
  }
  safepayClient = require("@sfpy/node-core")(process.env.SAFEPAY_SECRET_KEY, {
    authType: "secret",
    host: SAFEPAY_HOST,
  });
  return safepayClient;
}

const router = express.Router();


function getTrackerObject(res) {
  return (
    res?.data?.tracker ||
    res?.data?.data?.tracker ||
    res?.tracker ||
    null
  );
}

function getPassportToken(res) {
  if (typeof res === "string") return res;
  if (typeof res?.data === "string") return res.data;
  if (typeof res?.data?.data === "string") return res.data.data;
  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function markCompleted(purchase) {
  if (purchase && purchase.status !== "completed") {
    purchase.status = "completed";
    await purchase.save();
    console.log(`Purchase ${purchase._id} marked completed.`);
  }
}


function verifyWebhookSignature(rawText, payload, signatureHeader) {
  const secret = process.env.SAFEPAY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const received = Buffer.from(
    String(signatureHeader).trim().toLowerCase().replace(/^sha512=/, ""),
    "utf8"
  );

  const candidates = [];
  if (rawText) candidates.push(rawText);
  try {
    candidates.push(JSON.stringify(payload));
  } catch {}
  if (payload && payload.data !== undefined) {
    try {
      candidates.push(JSON.stringify(payload.data));
    } catch {}
  }

  for (const candidate of candidates) {
    const expected = Buffer.from(
      crypto.createHmac("sha512", secret).update(candidate).digest("hex"),
      "utf8"
    );
    if (expected.length === received.length && crypto.timingSafeEqual(expected, received)) {
      return true;
    }
  }
  return false;
}

async function handleSafepayWebhook(req, res) {
  try {
    const rawText = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : typeof req.body === "string"
      ? req.body
      : JSON.stringify(req.body || {});

    let payload = {};
    try {
      payload = rawText ? JSON.parse(rawText) : {};
    } catch {
      payload = {};
    }

    const signatureHeader = req.headers["x-sfpy-signature"];
    if (!verifyWebhookSignature(rawText, payload, signatureHeader)) {
      console.warn(
        "Safepay webhook: signature did not verify (check SAFEPAY_WEBHOOK_SECRET matches the secret of this environment's endpoint). Event rejected."
      );
      return res.status(400).json({ message: "Invalid signature" });
    }

    const type = payload.type;
    const data = payload.data || {};
    const tracker = data.tracker || null;
    console.log("Safepay webhook received:", { type, state: data.state, tracker });

    if (type !== "payment.succeeded") {
      return res.json({ received: true });
    }

    let purchase = null;
    if (tracker) {
      purchase = await Purchase.findOne({ paymentToken: tracker }).catch(() => null);
    }
    if (!purchase && data.metadata?.user_id && data.metadata?.book_id) {
      purchase = await Purchase.findOne({
        user: data.metadata.user_id,
        book: data.metadata.book_id,
      }).catch(() => null);
    }

    if (purchase) {
      await markCompleted(purchase);
    } else {
      console.warn("Safepay webhook: no purchase found for tracker", tracker);
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("Safepay webhook error:", err);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
}

// --- create checkout --------------------------------------------------------

router.post("/create-checkout-session", protect, async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findOne({ _id: bookId, published: true }).select(
      "title price currency"
    );
    if (!book) return res.status(404).json({ message: "Book not found" });

    const existing = await Purchase.findOne({
      user: req.user._id,
      book: book._id,
      status: "completed",
    });
    if (existing) {
      return res.status(400).json({ message: "You already own this book" });
    }

    const currency = (book.currency || "PKR").toUpperCase();

    const amount = Math.round(Number(book.price) * 100);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "This book cannot be purchased right now" });
    }

    const safepay = getSafepay();

    const session = await safepay.payments.session.setup({
      merchant_api_key: process.env.SAFEPAY_API_KEY,
      intent: "CYBERSOURCE",
      mode: "payment",
      entry_mode: "raw",
      currency,
      amount,
      metadata: {
        user_id: String(req.user._id),
        book_id: String(book._id),
      },
      include_fees: false,
    });
    const tracker = getTrackerObject(session)?.token;
    if (!tracker) {
      throw new Error("Safepay did not return a tracker token");
    }

    const passport = await safepay.client.passport.create();
    const tbt = getPassportToken(passport);
    if (!tbt) {
      throw new Error("Safepay did not return an authentication token");
    }

    await Purchase.findOneAndUpdate(
      { user: req.user._id, book: book._id },
      {
        user: req.user._id,
        book: book._id,
        paymentToken: tracker,
        amountPaid: book.price,
        currency,
        status: "pending",
      },
      { upsert: true, new: true }
    );

    const checkoutUrl = safepay.checkout.createCheckoutUrl({
      tracker,
      tbt,
      env: SAFEPAY_ENV,
      source: "hosted",
      redirect_url: `${process.env.API_BASE_URL}/api/payments/verify`,
      cancel_url: `${process.env.CLIENT_URL}/books/${book._id}?purchase=cancelled`,
    });

    res.json({ url: checkoutUrl });
  } catch (err) {
    console.error("Create checkout session error:", err);
    res.status(500).json({ message: "Could not start checkout" });
  }
});


router.all("/verify", async (req, res) => {
  const goTo = (status) =>
    res.redirect(`${process.env.CLIENT_URL}/library?purchase=${status}`);

  const tracker =
    req.query?.tracker ||
    req.body?.tracker ||
    req.query?.tracker_token ||
    req.body?.tracker_token ||
    null;

  console.log("Safepay redirect received:", { method: req.method, tracker });

  if (!tracker) {
    console.warn("Safepay redirect had no tracker; waiting for webhook instead.");
    return goTo("processing");
  }

  try {
    const POLL_ATTEMPTS = 8;
    const POLL_DELAY_MS = 1500;

    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
      const purchase = await Purchase.findOne({ paymentToken: String(tracker) });
      if (!purchase) return goTo("failed");
      if (purchase.status === "completed") return goTo("success");

      try {
        const result = await getSafepay().reporter.payments.fetch(String(tracker));
        const state = getTrackerObject(result)?.state;
        if (state === "TRACKER_ENDED") {
          await markCompleted(purchase);
          return goTo("success");
        }
      } catch (fetchErr) {
        console.warn("Safepay tracker lookup failed:", fetchErr?.message || fetchErr);
      }

      await sleep(POLL_DELAY_MS);
    }

    console.warn(`Tracker ${tracker} still not completed after polling; waiting for webhook.`);
    return goTo("processing");
  } catch (err) {
    console.error("Safepay verify/redirect error:", err);
    return goTo("failed");
  }
});

router.get("/my-library", protect, async (req, res) => {
  const purchases = await Purchase.find({ user: req.user._id, status: "completed" }).populate(
    "book",
    "title author coverImage"
  );
  res.json(purchases.map((p) => p.book));
});

module.exports = router;
module.exports.handleSafepayWebhook = handleSafepayWebhook;
