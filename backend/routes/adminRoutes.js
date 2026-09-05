const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const Book = require("../models/Book");
const { protect, adminOnly } = require("../middleware/auth");
const { extractFromFile } = require("../utils/extractContent");
const { uploadToR2, deleteFromR2 } = require("../utils/storage");

const router = express.Router();
router.use(protect, adminOnly);

const TMP_DIR = path.join(__dirname, "..", "uploads");
fs.mkdirSync(TMP_DIR, { recursive: true });

const upload = multer({
  dest: TMP_DIR,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "coverImage") {
      const allowedImages = ["image/jpeg", "image/png", "image/webp"];
      if (allowedImages.includes(file.mimetype)) return cb(null, true);
      return cb(new Error("Cover image must be a .jpg, .png, or .webp file"));
    }
    if (file.fieldname === "previewPdf") {
      if (file.mimetype === "application/pdf") return cb(null, true);
      return cb(new Error("Preview must be a .pdf file"));
    }
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only .pdf and .docx files are allowed"));
  },
});

const uploadBookFields = upload.fields([
  { name: "file", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
  { name: "previewPdf", maxCount: 1 },
]);

const uploadPreviewOnly = upload.fields([{ name: "previewPdf", maxCount: 1 }]);

router.post("/books", uploadBookFields, async (req, res) => {
  let tempPath;
  let coverTempPath;
  let previewTempPath;
  let persistedPath;
  let persistedCoverKey;
  let persistedPreviewKey;
  try {
    const { title, author, description, price, originalPrice, currency } = req.body;
    if (!title || price === undefined) {
      return res.status(400).json({ message: "Title and price are required" });
    }
    const bookFile = req.files?.file?.[0];
    const coverFile = req.files?.coverImage?.[0];
    const previewFile = req.files?.previewPdf?.[0];
    if (!bookFile) {
      return res.status(400).json({ message: "A .pdf or .docx file is required" });
    }
    tempPath = bookFile.path;

    const chapters = await extractFromFile(tempPath, bookFile.mimetype);
    const chaptersWithOrder = chapters.map((c, i) => ({
      title: c.title,
      order: i,
      content: c.content,
    }));

    let pdfFile = "";
    if (bookFile.mimetype === "application/pdf") {
      pdfFile = `${crypto.randomUUID()}.pdf`;
      await uploadToR2(tempPath, `books/${pdfFile}`, "application/pdf");
      persistedPath = pdfFile;
    }

    let coverImage = "";
    if (coverFile) {
      coverTempPath = coverFile.path;
      const ext = coverFile.mimetype === "image/png" ? "png" : coverFile.mimetype === "image/webp" ? "webp" : "jpg";
      coverImage = `${crypto.randomUUID()}.${ext}`;
      await uploadToR2(coverTempPath, `covers/${coverImage}`, coverFile.mimetype);
      persistedCoverKey = coverImage;
    }

    let previewPdf = "";
    if (previewFile) {
      previewTempPath = previewFile.path;
      previewPdf = `${crypto.randomUUID()}.pdf`;
      await uploadToR2(previewTempPath, `previews/${previewPdf}`, "application/pdf");
      persistedPreviewKey = previewPdf;
    }

    const book = await Book.create({
      title,
      author,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      currency: currency || "usd",
      chapters: chaptersWithOrder,
      pdfFile,
      coverImage,
      previewPdf,
      published: false,
    });

    res.status(201).json({ id: book._id, title: book.title, chapterCount: chaptersWithOrder.length });
  } catch (err) {
    console.error("Upload book error:", err);
    if (persistedPath) {
      await deleteFromR2(`books/${persistedPath}`);
    }
    if (persistedCoverKey) {
      await deleteFromR2(`covers/${persistedCoverKey}`);
    }
    if (persistedPreviewKey) {
      await deleteFromR2(`previews/${persistedPreviewKey}`);
    }
    res.status(500).json({ message: err.message || "Failed to process upload" });
  } finally {
    if (tempPath && fs.existsSync(tempPath)) fs.unlink(tempPath, () => {});
    if (coverTempPath && fs.existsSync(coverTempPath)) fs.unlink(coverTempPath, () => {});
    if (previewTempPath && fs.existsSync(previewTempPath)) fs.unlink(previewTempPath, () => {});
  }
});

router.get("/books", async (req, res) => {
  const books = await Book.find()
    .select("title author price originalPrice currency published chapters.title createdAt previewPdf")
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
  const { title, author, description, price, originalPrice, currency } = req.body;
  const book = await Book.findByIdAndUpdate(
    req.params.id,
    { title, author, description, price, originalPrice: originalPrice || null, currency },
    { new: true, runValidators: true }
  );
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book);
});

router.post("/books/:id/preview", uploadPreviewOnly, async (req, res) => {
  let tempPath;
  let persistedPreviewKey;
  try {
    const previewFile = req.files?.previewPdf?.[0];
    if (!previewFile) {
      return res.status(400).json({ message: "A .pdf file is required" });
    }
    tempPath = previewFile.path;

    const book = await Book.findById(req.params.id).select("previewPdf");
    if (!book) return res.status(404).json({ message: "Book not found" });

    const previewPdf = `${crypto.randomUUID()}.pdf`;
    await uploadToR2(tempPath, `previews/${previewPdf}`, "application/pdf");
    persistedPreviewKey = previewPdf;

    const oldPreviewKey = book.previewPdf;
    book.previewPdf = previewPdf;
    await book.save();

    if (oldPreviewKey) {
      await deleteFromR2(`previews/${oldPreviewKey}`);
    }

    res.json({ message: "Preview uploaded", previewPdf });
  } catch (err) {
    console.error("Upload preview error:", err);
    if (persistedPreviewKey) {
      await deleteFromR2(`previews/${persistedPreviewKey}`);
    }
    res.status(500).json({ message: err.message || "Failed to upload preview" });
  } finally {
    if (tempPath && fs.existsSync(tempPath)) fs.unlink(tempPath, () => {});
  }
});

router.delete("/books/:id", async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found" });
  if (book.pdfFile) {
    await deleteFromR2(`books/${book.pdfFile}`);
  }
  if (book.coverImage) {
    await deleteFromR2(`covers/${book.coverImage}`);
  }
  if (book.previewPdf) {
    await deleteFromR2(`previews/${book.previewPdf}`);
  }
  res.json({ message: "Book deleted" });
});

module.exports = router;
