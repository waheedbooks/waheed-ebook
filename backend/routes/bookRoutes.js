const express = require("express");
const fs = require("fs");
const path = require("path");
const Book = require("../models/Book");
const Purchase = require("../models/Purchase");
const { protect } = require("../middleware/auth");

const router = express.Router();
const BOOKS_DIR = path.join(__dirname, "..", "uploads", "books");

// Public: list all published books, WITHOUT chapter content.
router.get("/", async (req, res) => {
  try {
    const books = await Book.find({ published: true })
      .select("title author description price currency coverImage createdAt")
      .sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    console.error("List books error:", err);
    res.status(500).json({ message: "Could not load books" });
  }
});

// Public: single book metadata + chapter titles only (no content, no price gate needed
// since this is just a table of contents preview).
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, published: true }).select(
      "title author description price currency coverImage chapters.title chapters.order chapters._id pdfFile"
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
      currency: book.currency,
      coverImage: book.coverImage,
      chapters: chapterTitles,
      // The frontend uses this to decide whether to show the full PDF
      // viewer or fall back to the old plain-text chapter reader.
      hasPdf: Boolean(book.pdfFile),
    });
  } catch (err) {
    console.error("Get book error:", err);
    res.status(500).json({ message: "Could not load book" });
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

      const filePath = path.join(BOOKS_DIR, book.pdfFile);
      if (!fs.existsSync(filePath)) return res.status(404).end();
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

    const filePath = path.join(BOOKS_DIR, book.pdfFile);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "This book's file is missing on the server" });
    }

    const fileSize = fs.statSync(filePath).size;
    const range = req.headers.range;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${book.title}.pdf"`);
    res.setHeader("Accept-Ranges", "bytes");

    if (!range) {
      res.setHeader("Content-Length", fileSize);
      return fs.createReadStream(filePath).pipe(res);
    }

    const match = /bytes=(\d*)-(\d*)/.exec(range);
    let start = match?.[1] ? parseInt(match[1], 10) : 0;
    let end = match?.[2] ? parseInt(match[2], 10) : fileSize - 1;
    if (Number.isNaN(start) || start < 0) start = 0;
    if (Number.isNaN(end) || end >= fileSize) end = fileSize - 1;

    if (start > end) {
      res.setHeader("Content-Range", `bytes */${fileSize}`);
      return res.status(416).end();
    }

    res.status(206);
    res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
    res.setHeader("Content-Length", end - start + 1);
    fs.createReadStream(filePath, { start, end }).pipe(res);
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
