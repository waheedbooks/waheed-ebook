const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    order: { type: Number, required: true },
    content: { type: String, required: true },
  },
  { _id: true }
);

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0, default: null },
    currency: { type: String, default: "usd" },
    coverImage: { type: String, default: "" },
    chapters: [chapterSchema],
    pdfFile: { type: String, default: "" },
    previewPdf: { type: String, default: "" },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
