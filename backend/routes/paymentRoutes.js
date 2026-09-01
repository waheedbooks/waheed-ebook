const crypto = require("crypto");
const express = require("express");
const { Safepay } = require("@sfpy/node-sdk");
const Book = require("../models/Book");
const Purchase = require("../models/Purchase");
const { protect } = require("../middleware/auth");

const safepay = new Safepay({
  environment: process.env.SAFEPAY_ENVIRONMENT || "sandbox",
  apiKey: process.env.SAFEPAY_API_KEY,
  v1Secret: process.env.SAFEPAY_V1_SECRET,
  webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET,
});

const router = express.Router();

function verifyWebhookSignature(payload, signatureHeader) {
  if (!signatureHeader || !process.env.SAFEPAY_WEBHOOK_SECRET || !payload?.data) {
    return false;
  }
  const dataString = JSON.stringify(payload.data);
  const expected = crypto
    .createHmac("sha512", process.env.SAFEPAY_WEBHOOK_SECRET)
    .update(dataString)
    .digest("hex");
  console.log("Webhook signature check:", {
    receivedSignaturePreview: signatureHeader.slice(0, 12) + "…",
    expectedSignaturePreview: expected.slice(0, 12) + "…",
  });
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signatureHeader, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function extractPaymentEvent(payload) {
  const notification = payload?.data?.notification || payload?.notification || {};
  const state = notification.state || payload?.state || null;
  const tracker = notification.tracker || notification.token || payload?.tracker || null;
  const orderId =
    notification?.metadata?.order_id ||
    payload?.data?.metadata?.order_id ||
    payload?.metadata?.order_id ||
    null;
  return { state, tracker, orderId };
}

const PAID_STATES = new Set(["PAID", "TRACKER_ENDED", "COMPLETED", "SUCCEEDED"]);

async function handleSafepayWebhook(req, res) {
  try {
    const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from("");
    const rawText = raw.toString("utf8");
    let payload = {};
    try {
      payload = rawText ? JSON.parse(rawText) : {};
    } catch {
      payload = {};
    }

    console.log("Safepay webhook payload:", rawText);

    const signatureHeader = req.headers["x-sfpy-signature"];
    const verified = verifyWebhookSignature(payload, signatureHeader);
    if (!verified) {
      console.warn(
        "Safepay webhook: signature did not verify (check SAFEPAY_WEBHOOK_SECRET matches your dashboard's webhook signing secret). Ignoring this event."
      );
      return res.json({ received: true });
    }

    const { state, orderId } = extractPaymentEvent(payload);
    console.log("Safepay webhook parsed:", { state, orderId });

    if (!orderId || !PAID_STATES.has(state)) {
      return res.json({ received: true });
    }

    const purchase = await Purchase.findById(orderId).catch(() => null);
    if (!purchase) return res.json({ received: true });

    if (purchase.status !== "completed") {
      purchase.status = "completed";
      await purchase.save();
      console.log(`Purchase ${orderId} marked completed via webhook.`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Safepay webhook error:", err);
    res.status(500).json({ message: "Webhook processing failed" });
  }
}

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

    // Safepay's SDK expects the amount in normal currency units (e.g. 5
    // for $5), not in subunits/cents like Stripe — sending price * 100
    // here caused Safepay to charge 100x the book's price.
    const { token } = await safepay.payments.create({
      amount: book.price,
      currency,
    });

    const purchase = await Purchase.findOneAndUpdate(
      { user: req.user._id, book: book._id },
      {
        user: req.user._id,
        book: book._id,
        paymentToken: token,
        amountPaid: book.price,
        currency,
        status: "pending",
      },
      { upsert: true, new: true }
    );

    const checkoutUrl = safepay.checkout.create({
      token,
      orderId: purchase._id.toString(),
      cancelUrl: `${process.env.CLIENT_URL}/books/${book._id}?purchase=cancelled`,
      redirectUrl: `${process.env.API_BASE_URL}/api/payments/verify`,
      source: "custom",
      webhooks: true,
    });

    res.json({ url: checkoutUrl });
  } catch (err) {
    console.error("Create checkout session error:", err);
    res.status(500).json({ message: "Could not start checkout" });
  }
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

router.all("/verify", async (req, res) => {
  const goTo = (status) => res.redirect(`${process.env.CLIENT_URL}/library?purchase=${status}`);

  console.log("Safepay redirect received:", {
    method: req.method,
    query: req.query,
    body: req.body,
  });

  const orderId = req.query.order_id || req.body?.order_id || req.query.orderId;
  if (!orderId) {
    console.warn("Safepay redirect missing order_id.");
    return goTo("failed");
  }

  try {
    const POLL_ATTEMPTS = 8;
    const POLL_DELAY_MS = 1000;

    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
      const purchase = await Purchase.findById(orderId);
      if (!purchase) return goTo("failed");
      if (purchase.status === "completed") return goTo("success");
      await sleep(POLL_DELAY_MS);
    }

    console.warn(
      `Purchase ${orderId} still pending after polling — webhook likely hasn't arrived yet (check that your backend is publicly reachable for Safepay's webhook, e.g. via ngrok).`
    );
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
