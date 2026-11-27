const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendLoginPinEmail,
} = require("../utils/mailer");

const router = express.Router();

// A login session lasts 2 days.
const SESSION_LENGTH = "2d";

// Login PIN settings
const PIN_TTL_MS = 10 * 60 * 1000; // a PIN is valid for 10 minutes
const PIN_RESEND_COOLDOWN_MS = 60 * 1000; // a new PIN can be sent after 1 minute
const PIN_MAX_ATTEMPTS = 5; // wrong guesses allowed per PIN

// The emailed login PIN is on by default. Set LOGIN_PIN_REQUIRED=false in the
// environment to switch it off (logins then work with just email + password).
function pinRequired() {
  return String(process.env.LOGIN_PIN_REQUIRED || "true").toLowerCase() !== "false";
}

function hashPin(userId, pin) {
  return crypto.createHmac("sha256", process.env.JWT_SECRET).update(`${userId}:${pin}`).digest("hex");
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

function maskEmail(email) {
  const [name, domain] = String(email).split("@");
  if (!domain) return email;
  return `${name.slice(0, 2)}${"*".repeat(Math.max(name.length - 2, 1))}@${domain}`;
}

function clearLoginPin(user) {
  user.loginPinHash = undefined;
  user.loginPinExpires = undefined;
  user.loginPinSentAt = undefined;
  user.loginPinAttempts = 0;
}

function signToken(user, sessionId) {
  return jwt.sign({ id: user._id, role: user.role, sessionId }, process.env.JWT_SECRET, {
    expiresIn: SESSION_LENGTH,
  });
}

async function startNewSession(user) {
  const sessionId = crypto.randomBytes(16).toString("hex");
  user.currentSessionId = sessionId;
  await user.save();
  return sessionId;
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() }).select(
      "+verifyTokenExpires"
    );
    if (existing && existing.isVerified) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    // An unverified account is not usable yet, so registering again with the same email
    // simply restarts sign-up (new details + fresh link) instead of blocking the person.
    // Cooldown: if a link was sent less than 60s ago, don't send another.
    if (
      existing &&
      existing.verifyTokenExpires &&
      existing.verifyTokenExpires.getTime() - 24 * 60 * 60 * 1000 + 60 * 1000 > Date.now()
    ) {
      return res.status(429).json({
        message: "A verification email was just sent. Please wait a minute and try again.",
      });
    }

    const role =
      adminCode && adminCode === process.env.ADMIN_SIGNUP_CODE ? "admin" : "student";

    let user;
    if (existing) {
      existing.name = name;
      existing.password = password;
      existing.role = role;
      user = existing;
    } else {
      user = await User.create({ name, email, password, role, isVerified: false });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.verifyTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.verifyTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${rawToken}`;
    try {
      await sendVerificationEmail(user.email, verifyUrl);
    } catch (mailErr) {
      console.error("Failed to send verification email:", mailErr);
    }

    res.status(201).json({
      message: "Account created. Please check your email to verify your address before logging in.",
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password +loginPinExpires +loginPinSentAt"
    );
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        needsVerification: true,
      });
    }

    // Admin accounts skip the PIN (the admin email is not a real inbox), and so does
    // everyone when the PIN is switched off: log in with email + password only.
    if (!pinRequired() || user.role === "admin") {
      const sessionId = await startNewSession(user);
      const token = signToken(user, sessionId);
      return res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    }

    // Step 1 of 2: password is correct, so email a 6-digit PIN.
    // No session is created yet, so nobody is logged out of their other device
    // until the PIN is entered correctly.
    const now = Date.now();
    const sentAt = user.loginPinSentAt ? user.loginPinSentAt.getTime() : 0;
    const pinStillValid = user.loginPinExpires && user.loginPinExpires.getTime() > now;
    if (pinStillValid && now - sentAt < PIN_RESEND_COOLDOWN_MS) {
      return res.json({
        pinRequired: true,
        emailHint: maskEmail(user.email),
        message:
          "A PIN was sent to your email a moment ago. Please use it, or wait a minute to get a new one.",
      });
    }

    const pin = String(crypto.randomInt(100000, 1000000));
    user.loginPinHash = hashPin(user._id, pin);
    user.loginPinExpires = new Date(now + PIN_TTL_MS);
    user.loginPinSentAt = new Date(now);
    user.loginPinAttempts = 0;
    await user.save();

    try {
      await sendLoginPinEmail(user.email, pin);
    } catch (mailErr) {
      console.error("Failed to send login PIN email:", mailErr);
      clearLoginPin(user);
      await user.save();
      return res.status(500).json({
        message: "We couldn't send your login PIN right now. Please try again in a moment.",
      });
    }

    res.json({
      pinRequired: true,
      emailHint: maskEmail(user.email),
      message: `We've sent a 6-digit PIN to ${maskEmail(user.email)}. It expires in 10 minutes.`,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// Step 2 of 2: check the PIN, then start the session (this logs out any other device).
router.post("/verify-login-pin", async (req, res) => {
  try {
    const { email, pin } = req.body;
    const cleanPin = String(pin || "").trim();
    if (!email || !/^\d{6}$/.test(cleanPin)) {
      return res.status(400).json({ message: "Please enter the 6-digit PIN from your email." });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() }).select(
      "+loginPinHash +loginPinExpires +loginPinAttempts +loginPinSentAt"
    );

    const expiredReply = {
      message: "This PIN has expired. Please log in again to get a new one.",
      pinExpired: true,
    };
    if (
      !user ||
      !user.loginPinHash ||
      !user.loginPinExpires ||
      user.loginPinExpires.getTime() < Date.now()
    ) {
      return res.status(400).json(expiredReply);
    }

    if (!safeEqual(user.loginPinHash, hashPin(user._id, cleanPin))) {
      user.loginPinAttempts = (user.loginPinAttempts || 0) + 1;
      const attemptsLeft = PIN_MAX_ATTEMPTS - user.loginPinAttempts;
      if (attemptsLeft <= 0) {
        clearLoginPin(user);
        await user.save();
        return res.status(429).json({
          message: "Too many wrong PINs. Please log in again to get a new one.",
          pinExpired: true,
        });
      }
      await user.save();
      return res.status(400).json({
        message: `Incorrect PIN. You have ${attemptsLeft} ${attemptsLeft === 1 ? "try" : "tries"} left.`,
      });
    }

    clearLoginPin(user);
    const sessionId = await startNewSession(user); // also saves the cleared PIN
    const token = signToken(user, sessionId);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Verify login PIN error:", err);
    res.status(500).json({ message: "Could not verify the PIN" });
  }
});

router.post("/logout", protect, async (req, res) => {
  try {
    req.user.currentSessionId = undefined;
    await req.user.save();
    res.json({ message: "Logged out." });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
});

router.get("/me", protect, async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
      await user.save();

      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
      try {
        await sendPasswordResetEmail(user.email, resetUrl);
      } catch (mailErr) {
        console.error("Failed to send password reset email:", mailErr);
      }
    }

    res.json({ message: "If an account exists for that email, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Could not process request" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const tokenHash = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password +resetPasswordTokenHash +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({ message: "This reset link is invalid or has expired" });
    }

    user.password = password;
    // They just proved they own this inbox, so an unverified account is verified too.
    user.isVerified = true;
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password updated. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Could not reset password" });
  }
});

router.post("/verify-email/:token", async (req, res) => {
  try {
    const tokenHash = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      verifyTokenHash: tokenHash,
      verifyTokenExpires: { $gt: Date.now() },
    }).select("+verifyTokenHash +verifyTokenExpires");

    if (!user) {
      return res.status(400).json({ message: "This verification link is invalid or has expired." });
    }

    user.isVerified = true;
    user.verifyTokenHash = undefined;
    user.verifyTokenExpires = undefined;
    await user.save();

    const sessionId = await startNewSession(user);
    const token = signToken(user, sessionId);
    res.json({
      message: "Email verified.",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ message: "Could not verify email" });
  }
});

router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() }).select("+verifyTokenExpires");

    // Cooldown: skip if a link was sent less than 60s ago (stops inbox spamming).
    // The response stays generic so it doesn't reveal whether the account exists.
    const sentRecently =
      user &&
      user.verifyTokenExpires &&
      user.verifyTokenExpires.getTime() - 24 * 60 * 60 * 1000 + 60 * 1000 > Date.now();

    if (user && !user.isVerified && !sentRecently) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      user.verifyTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      user.verifyTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
      await user.save();

      const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${rawToken}`;
      try {
        await sendVerificationEmail(user.email, verifyUrl);
      } catch (mailErr) {
        console.error("Failed to resend verification email:", mailErr);
      }
    }

    res.json({ message: "If that account needs verifying, a new link has been sent." });
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ message: "Could not process request" });
  }
});

module.exports = router;
