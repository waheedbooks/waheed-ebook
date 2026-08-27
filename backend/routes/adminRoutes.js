const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const Book = require("../models/Book");
const { protect, adminOnly } = require("../middleware/auth");
const { extractFromFile } = require("../utils/extractContent");

const router = express.Router();
router.use(protect, adminOnly);

const BOOKS_DIR = path.join(__dirname, "..", "uploads", "books");
fs.mkdirSync(BOOKS_DIR, { recursive: true });

const upload = multer({
  dest: path.join(__dirname, "..", "uploads"),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only .pdf and .docx files are allowed"));
  },
});

router.post("/books", upload.single("file"), async (req, res) => {
  let tempPath;
  let persistedPath;
  try {
    const { title, author, description, price, currency } = req.body;
    if (!title || price === undefined) {
      return res.status(400).json({ message: "Title and price are required" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "A .pdf or .docx file is required" });
    }
    tempPath = req.file.path;

    const chapters = await extractFromFile(tempPath, req.file.mimetype);
    const chaptersWithOrder = chapters.map((c, i) => ({
      title: c.title,
      order: i,
      content: c.content,
    }));

    let pdfFile = "";
    if (req.file.mimetype === "application/pdf") {
      pdfFile = `${crypto.randomUUID()}.pdf`;
      persistedPath = path.join(BOOKS_DIR, pdfFile);
      fs.copyFileSync(tempPath, persistedPath);
    }

    const book = await Book.create({
      title,
      author,
      description,
      price: Number(price),
      currency: currency || "usd",
      chapters: chaptersWithOrder,
      pdfFile,
      published: false,
    });

    res.status(201).json({ id: book._id, title: book.title, chapterCount: chaptersWithOrder.length });
  } catch (err) {
    console.error("Upload book error:", err);
    if (persistedPath && fs.existsSync(persistedPath)) {
      fs.unlink(persistedPath, () => {});
    }
    res.status(500).json({ message: err.message || "Failed to process upload" });
  } finally {
    if (tempPath && fs.existsSync(tempPath)) {
      fs.unlink(tempPath, () => {});
    }
  }
});

router.get("/books", async (req, res) => {
  const books = await Book.find()
    .select("title author price currency published chapters.title createdAt")
    .sort({ createdAt: -1 });
  res.json(books);
});

router.patch("/books/:id/publish", async (req, res) => {
  const book = await Book.findByIdAndUpdate(
    req.params.id,
    { published: req.body.published !== false },
    { new: true }
  ).select("title published");
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book);
});

router.patch("/books/:id", async (req, res) => {
  const { title, author, description, price, currency } = req.body;
  const book = await Book.findByIdAndUpdate(
    req.params.id,
    { title, author, description, price, currency },
    { new: true, runValidators: true }
  );
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book);
});

router.delete("/books/:id", async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found" });
  if (book.pdfFile) {
    const filePath = path.join(BOOKS_DIR, book.pdfFile);
    fs.unlink(filePath, () => {});
  }
  res.json({ message: "Book deleted" });
});

module.exports = router;
