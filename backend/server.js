require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// Render (and most hosts) sit behind a reverse proxy, which sets
// X-Forwarded-For to the real client IP. Without this, express-rate-limit
// throws ERR_ERL_UNEXPECTED_X_FORWARDED_FOR and crashes any rate-limited
// request — including the payment verify/webhook routes.
app.set("trust proxy", 1);

connectDB();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    // pdf.js reads these to know it can fetch the PDF in byte-range
    // chunks instead of downloading the whole file up front — without
    // exposing them, the browser hides these headers from cross-origin
    // JS even though the server sends them.
    exposedHeaders: ["Content-Range", "Accept-Ranges", "Content-Length"],
  })
);

// The Safepay webhook MUST receive the raw, unparsed body to verify its
// signature, so this exact route is registered — with express.raw() —
// before the global express.json() middleware below. Every other route
// gets normal JSON parsing.
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentRoutes.handleSafepayWebhook
);

app.use(express.json({ limit: "1mb" }));

app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Basic protection against brute-force login/register attempts.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/books", bookRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Centralized error handler — keeps the process from crashing on an
// uncaught error inside a route and avoids leaking stack traces.
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Safety nets so an unexpected rejection/exception doesn't silently kill
// the app without a log — important for "won't crash" reliability.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
