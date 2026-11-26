const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    isVerified: { type: Boolean, default: false },
    verifyTokenHash: { type: String, select: false },
    verifyTokenExpires: { type: Date, select: false },
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    currentSessionId: { type: String, select: false },
    loginPinHash: { type: String, select: false },
    loginPinExpires: { type: Date, select: false },
    loginPinAttempts: { type: Number, default: 0, select: false },
    loginPinSentAt: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.index(
  { verifyTokenExpires: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60, partialFilterExpression: { isVerified: false } }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
