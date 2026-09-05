import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { shelfColor } from "../lib/shelfColor";

const API_BASE = import.meta.env.VITE_API_URL;
function coverSrc(book) {
  return book.coverImage ? `${API_BASE}/books/${book.id}/cover` : null;
}

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [error, setError] = useState("");
  const [buying, setBuying] = useState(false);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    api
      .get(`/books/${id}`)
      .then((res) => setBook(res.data))
      .catch(() => setError("Book not found"));
  }, [id]);

  async function handleBuy() {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setBuying(true);
    setError("");
    try {
      const res = await api.post("/payments/create-checkout-session", { bookId: id });
      window.location.href = res.data.url;
    } catch (err) {
      setError(err.response?.data?.message || "Could not start checkout");
      setBuying(false);
    }
  }

  if (error && !book) return <p className="state-line error">{error}</p>;
  if (!book) return <p className="state-line">Loading…</p>;

  const hasDiscount = book.originalPrice > book.price;
  const percentOff = hasDiscount
    ? Math.round(100 - (book.price / book.originalPrice) * 100)
    : 0;

  return (
    <div className="page">
      {searchParams.get("purchase") === "cancelled" && (
        <p className="notice">Checkout was cancelled — you weren't charged.</p>
      )}

      <div className="book-detail-head">
        <div className="book-detail-cover-wrap">
          {coverSrc(book) ? (
            <img src={coverSrc(book)} alt={book.title} className="book-detail-cover" />
          ) : (
            <div className="book-detail-spine" style={{ "--shelf-color": shelfColor(book.id) }} />
          )}
          {hasDiscount && <span className="book-detail-discount-flag">-{percentOff}%</span>}
        </div>

        <div className="book-detail-body">
          <span className="eyebrow">Book detail</span>
          <h2>{book.title}</h2>
          {book.author && <p className="muted">by {book.author}</p>}

          <div className="book-detail-price-tag">
            {hasDiscount && (
              <div className="book-detail-price-block">
                <span className="book-detail-price-label">Original Price</span>
                <span className="book-detail-price-original">
                  {book.currency?.toUpperCase()} {book.originalPrice}
                </span>
              </div>
            )}
            <div className="book-detail-price-block">
              <span className="book-detail-price-label">
                {hasDiscount ? "Discount Price" : "Price"}
              </span>
              <span className="book-detail-price-current">
                {book.currency?.toUpperCase()} {book.price}
              </span>
            </div>
          </div>

          {error && <p className="error">{error}</p>}
          <div className="book-detail-actions">
            <button onClick={handleBuy} disabled={buying}>
              {buying ? "Redirecting to checkout…" : `Buy for ${book.currency?.toUpperCase()} ${book.price}`}
            </button>
            {book.hasPreview && (
              <a
                className="preview-download-link"
                href={`${API_BASE}/books/${book.id}/preview`}
                download
              >
                Download contents &amp; preface (PDF)
              </a>
            )}
          </div>
          <p className="muted" style={{ marginTop: 10 }}>
            Already own this? Go to <Link to="/library">My Library</Link>.
          </p>

          <p className="book-detail-desc">{book.description}</p>
        </div>
      </div>

      <div className="toc-card">
        <h3>Table of contents</h3>
        <ol>
          {book.chapters.map((c) => (
            <li key={c.id}>{c.title}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
