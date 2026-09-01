const express = require("express");
const Book = require("../models/Book");
const Purchase = require("../models/Purchase");
const { protect } = require("../middleware/auth");
const { existsInR2, getObjectStream } = require("../utils/storage");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const books = await Book.find({ published: true })
      .select("title author description price originalPrice currency coverImage createdAt")
      .sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    console.error("List books error:", err);
    res.status(500).json({ message: "Could not load books" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, published: true }).select(
      "title author description price originalPrice currency coverImage chapters.title chapters.order chapters._id pdfFile"
    );
    if (!book) return res.status(404).json({ message: "Book not found" });

    const chapterTitles = book.chapters
      .sort((a, b) => a.order - b.order)
      .map((c) => ({ id: c._id, title: c.title }));

    res.json({
      id: book._id,
      title: book.title,
      author: book.author,
      description: book.description,
      price: book.price,
      originalPrice: book.originalPrice,
      currency: book.currency,
      coverImage: book.coverImage,
      chapters: chapterTitles,
      hasPdf: Boolean(book.pdfFile),
    });
  } catch (err) {
    console.error("Get book error:", err);
    res.status(500).json({ message: "Could not load book" });
  }
});

router.get("/:id/cover", async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, published: true }).select("coverImage");
    if (!book || !book.coverImage) return res.status(404).end();

    const exists = await existsInR2(`covers/${book.coverImage}`);
    if (!exists) return res.status(404).end();

    const ext = book.coverImage.split(".").pop();
    const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // covers rarely change; safe to cache a day

    const r2Result = await getObjectStream(`covers/${book.coverImage}`);
    res.setHeader("Content-Length", r2Result.ContentLength);
    r2Result.Body.pipe(res);
  } catch (err) {
    console.error("Get cover error:", err);
    res.status(500).end();
  }
});

router.head("/:id/pdf", protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).select("pdfFile");
    if (!book || !book.pdfFile) return res.status(404).end();

    if (req.user.role !== "admin") {
      const purchase = await Purchase.findOne({
        user: req.user._id,
        book: book._id,
        status: "completed",
      });

      if (!purchase) return res.status(403).end();

      const exists = await existsInR2(`books/${book.pdfFile}`);
      if (!exists) return res.status(404).end();
    }

    res.status(200).end();
  } catch (err) {
    console.error("PDF access check error:", err);
    res.status(500).end();
  }
});

router.get("/:id/pdf", protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).select("title pdfFile");
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (!book.pdfFile) {
      return res.status(404).json({ message: "No PDF is available for this book yet" });
    }

    if (req.user.role !== "admin") {
      const purchase = await Purchase.findOne({
        user: req.user._id,
        book: book._id,
        status: "completed",
      });
      if (!purchase) {
        return res.status(403).json({ message: "Purchase required to view this content" });
      }
    }

    const exists = await existsInR2(`books/${book.pdfFile}`);
    if (!exists) {
      return res.status(404).json({ message: "This book's file is missing on the server" });
    }

    const range = req.headers.range;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${book.title}.pdf"`);
    res.setHeader("Accept-Ranges", "bytes");

    const r2Result = await getObjectStream(`books/${book.pdfFile}`, range);

    if (range && r2Result.ContentRange) {
      res.status(206);
      res.setHeader("Content-Range", r2Result.ContentRange);
    }
    res.setHeader("Content-Length", r2Result.ContentLength);
    r2Result.Body.pipe(res);
  } catch (err) {
    console.error("Stream PDF error:", err);
    res.status(500).json({ message: "Could not load PDF" });
  }
});

router.get("/:id/chapters/:chapterId", protect, async (req, res) => {
  try {
    const { id, chapterId } = req.params;

    if (req.user.role !== "admin") {
      const purchase = await Purchase.findOne({
        user: req.user._id,
        book: id,
        status: "completed",
      });
      if (!purchase) {
        return res.status(403).json({ message: "Purchase required to view this content" });
      }
    }

    const book = await Book.findById(id).select("chapters title");
    if (!book) return res.status(404).json({ message: "Book not found" });

    const chapter = book.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    res.json({
      bookTitle: book.title,
      title: chapter.title,
      content: chapter.content,
      viewer: { name: req.user.name, email: req.user.email },
    });
  } catch (err) {
    console.error("Get chapter error:", err);
    res.status(500).json({ message: "Could not load chapter" });
  }
});

module.exports = router;
