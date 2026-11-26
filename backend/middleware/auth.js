const jwt = require("jsonwebtoken");
const User = require("../models/User");

// A login session lasts 2 days, no matter what expiry an older token was issued with.
const MAX_SESSION_SECONDS = 2 * 24 * 60 * 60;

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.iat && Math.floor(Date.now() / 1000) - decoded.iat > MAX_SESSION_SECONDS) {
      return res.status(401).json({
        message: "Your session has expired. Please log in again.",
        sessionExpired: true,
      });
    }
    const user = await User.findById(decoded.id).select("+currentSessionId");
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    if (!decoded.sessionId || decoded.sessionId !== user.currentSessionId) {
      return res.status(401).json({
        message: "You have been logged out because your account was signed in from another device.",
        sessionExpired: true,
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Your session has expired. Please log in again.",
        sessionExpired: true,
      });
    }
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

module.exports = { protect, adminOnly };
