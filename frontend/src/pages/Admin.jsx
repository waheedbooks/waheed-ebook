import { useEffect, useState, Fragment } from "react";
import api from "../api";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Admin() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ title: "", author: "", description: "", price: "", originalPrice: "", currency: "usd" });
  const [file, setFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [previewPdf, setPreviewPdf] = useState(null);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUploadingId, setPreviewUploadingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

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
      if (coverImage) data.append("coverImage", coverImage);
      if (previewPdf) data.append("previewPdf", previewPdf);

      const res = await api.post("/admin/books", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus(`Uploaded "${res.data.title}" with ${res.data.chapterCount} chapter(s). Publish it below.`);
      setForm({ title: "", author: "", description: "", price: "", originalPrice: "", currency: "usd" });
      setFile(null);
      setCoverImage(null);
      setPreviewPdf(null);
      loadBooks();
    } catch (err) {
      setStatus(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handlePreviewUpload(bookId, previewFile) {
    if (!previewFile) return;
    setPreviewUploadingId(bookId);
    setStatus("");
    try {
      const data = new FormData();
      data.append("previewPdf", previewFile);
      await api.post(`/admin/books/${bookId}/preview`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      loadBooks();
    } catch (err) {
      setStatus(err.response?.data?.message || "Preview upload failed");
    } finally {
      setPreviewUploadingId(null);
    }
  }

  function startEdit(book) {
    setEditingId(book._id);
    setEditForm({
      title: book.title || "",
      author: book.author || "",
      description: book.description || "",
      price: book.price ?? "",
      originalPrice: book.originalPrice ?? "",
      currency: book.currency || "usd",
    });
    setEditCoverFile(null);
    setStatus("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
    setEditCoverFile(null);
  }

  function updateEdit(field) {
    return (e) => setEditForm({ ...editForm, [field]: e.target.value });
  }

  async function saveEdit(bookId) {
    setEditSaving(true);
    setStatus("");
    try {
      await api.patch(`/admin/books/${bookId}`, {
        title: editForm.title,
        author: editForm.author,
        description: editForm.description,
        price: editForm.price,
        originalPrice: editForm.originalPrice || null,
        currency: editForm.currency,
      });
      if (editCoverFile) {
        const data = new FormData();
        data.append("coverImage", editCoverFile);
        await api.post(`/admin/books/${bookId}/cover`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      cancelEdit();
      loadBooks();
    } catch (err) {
      setStatus(err.response?.data?.message || "Update failed");
    } finally {
      setEditSaving(false);
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
        <input type="number" step="0.01" min="0" placeholder="Original price (optional — shown crossed out)" value={form.originalPrice} onChange={update("originalPrice")} />
        <input type="number" step="0.01" min="0" placeholder="Price" value={form.price} onChange={update("price")} required />
        <select value={form.currency} onChange={update("currency")}>
          <option value="usd">USD</option>
          <option value="gbp">GBP</option>
          <option value="eur">EUR</option>
        </select>
        <input type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files[0])} required />
        <label className="upload-form-label">
          Cover image (optional — shown on the home page)
          <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setCoverImage(e.target.files[0])} />
        </label>
        <label className="upload-form-label">
          Preview PDF (optional — contents & preface, free to download from the book page)
          <input type="file" accept=".pdf" onChange={(e) => setPreviewPdf(e.target.files[0])} />
        </label>
        <button type="submit" disabled={uploading}>{uploading ? "Uploading…" : "Upload"}</button>
        {status && <p className="notice">{status}</p>}
      </form>

      <h3>All books</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th><th>Price</th><th>Chapters</th><th>Published</th><th>Preview</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <Fragment key={b._id}>
            <tr>
              <td>{b.title}</td>
              <td>
                {b.originalPrice > b.price && (
                  <s className="muted" style={{ marginRight: 6 }}>
                    {b.currency?.toUpperCase()} {b.originalPrice}
                  </s>
                )}
                {b.currency?.toUpperCase()} {b.price}
              </td>
              <td>{b.chapters?.length ?? 0}</td>
              <td>{b.published ? "Yes" : "No"}</td>
              <td>
                <label className="muted" style={{ fontSize: "0.85em", cursor: "pointer" }}>
                  {previewUploadingId === b._id
                    ? "Uploading…"
                    : b.previewPdf
                    ? "Replace"
                    : "Add PDF"}
                  <input
                    type="file"
                    accept=".pdf"
                    style={{ display: "none" }}
                    disabled={previewUploadingId === b._id}
                    onChange={(e) => handlePreviewUpload(b._id, e.target.files[0])}
                  />
                </label>
              </td>
              <td>
                <button onClick={() => (editingId === b._id ? cancelEdit() : startEdit(b))}>
                  {editingId === b._id ? "Close" : "Edit"}
                </button>
                <button onClick={() => togglePublish(b)}>{b.published ? "Unpublish" : "Publish"}</button>
                <button onClick={() => deleteBook(b)}>Delete</button>
              </td>
            </tr>
            {editingId === b._id && (
              <tr className="admin-edit-row">
                <td colSpan={6}>
                  <div className="edit-panel">
                    <div className="edit-panel-cover">
                      {b.published ? (
                        <img
                          src={`${API_BASE}/books/${b._id}/cover`}
                          alt={`${b.title} cover`}
                          className="edit-panel-cover-img"
                        />
                      ) : (
                        <div className="edit-panel-cover-placeholder">
                          Publish the book to preview its cover here
                        </div>
                      )}
                      <label className="muted" style={{ fontSize: "0.85em", cursor: "pointer" }}>
                        {editCoverFile ? editCoverFile.name : "Replace cover image"}
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp"
                          style={{ display: "none" }}
                          onChange={(e) => setEditCoverFile(e.target.files[0])}
                        />
                      </label>
                    </div>
                    <div className="edit-panel-fields">
                      <input placeholder="Title" value={editForm.title} onChange={updateEdit("title")} />
                      <input placeholder="Author" value={editForm.author} onChange={updateEdit("author")} />
                      <textarea
                        placeholder="Description"
                        value={editForm.description}
                        onChange={updateEdit("description")}
                        rows={3}
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Original price (optional)"
                        value={editForm.originalPrice}
                        onChange={updateEdit("originalPrice")}
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Price"
                        value={editForm.price}
                        onChange={updateEdit("price")}
                      />
                      <select value={editForm.currency} onChange={updateEdit("currency")}>
                        <option value="usd">USD</option>
                        <option value="gbp">GBP</option>
                        <option value="eur">EUR</option>
                      </select>
                      <div>
                        <button onClick={() => saveEdit(b._id)} disabled={editSaving}>
                          {editSaving ? "Saving…" : "Save changes"}
                        </button>
                        <button onClick={cancelEdit} disabled={editSaving}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
