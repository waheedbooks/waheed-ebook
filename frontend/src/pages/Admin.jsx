import { useEffect, useState } from "react";
import api from "../api";

export default function Admin() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ title: "", author: "", description: "", price: "", currency: "usd" });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  function loadBooks() {
    api.get("/admin/books").then((res) => setBooks(res.data));
  }

  useEffect(loadBooks, []);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      setStatus("Please choose a .docx or .pdf file");
      return;
    }
    setUploading(true);
    setStatus("");
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      data.append("file", file);

      const res = await api.post("/admin/books", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus(`Uploaded "${res.data.title}" with ${res.data.chapterCount} chapter(s). Publish it below.`);
      setForm({ title: "", author: "", description: "", price: "", currency: "usd" });
      setFile(null);
      loadBooks();
    } catch (err) {
      setStatus(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function togglePublish(book) {
    await api.patch(`/admin/books/${book._id}/publish`, { published: !book.published });
    loadBooks();
  }

  async function deleteBook(book) {
    if (!confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    await api.delete(`/admin/books/${book._id}`);
    loadBooks();
  }

  return (
    <div className="page">
      <div className="page-hero">
        <span className="eyebrow">Admin</span>
        <h2>Manage books</h2>
        <p>Upload a manuscript, set its price, then publish it to the shelf.</p>
      </div>

      <form onSubmit={handleUpload} className="upload-form">
        <h3>Upload a new book</h3>
        <input placeholder="Title" value={form.title} onChange={update("title")} required />
        <input placeholder="Author" value={form.author} onChange={update("author")} />
        <textarea placeholder="Description" value={form.description} onChange={update("description")} rows={3} />
        <input type="number" step="0.01" min="0" placeholder="Price" value={form.price} onChange={update("price")} required />
        <select value={form.currency} onChange={update("currency")}>
          <option value="usd">USD</option>
          <option value="gbp">GBP</option>
          <option value="eur">EUR</option>
        </select>
        <input type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files[0])} required />
        <button type="submit" disabled={uploading}>{uploading ? "Uploading…" : "Upload"}</button>
        {status && <p className="notice">{status}</p>}
      </form>

      <h3>All books</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th><th>Price</th><th>Chapters</th><th>Published</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b._id}>
              <td>{b.title}</td>
              <td>{b.currency?.toUpperCase()} {b.price}</td>
              <td>{b.chapters?.length ?? 0}</td>
              <td>{b.published ? "Yes" : "No"}</td>
              <td>
                <button onClick={() => togglePublish(b)}>{b.published ? "Unpublish" : "Publish"}</button>
                <button onClick={() => deleteBook(b)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
