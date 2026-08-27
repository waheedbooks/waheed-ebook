const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    // Exit so process managers (Render/PM2) restart the service instead of
    // running with a dead DB connection.
    process.exit(1);
  }
}

module.exports = connectDB;
