import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { shelfColor } from "../lib/shelfColor";

const API_BASE = import.meta.env.VITE_API_URL;
function coverSrc(book) {
  return book.coverImage ? `${API_BASE}/books/${book._id}/cover` : null;
}

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/books")
      .then((res) => setBooks(res.data))
      .catch(() => setError("Could not load books. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="state-line">Loading books…</p>;
  if (error) return <p className="state-line error">{error}</p>;

  return (
    <div className="page">
      <div className="page-hero">
        <span className="eyebrow">Browse the shelf</span>
        <h2>Available books</h2>
        <p>Buy once, read anytime in the built-in reader — no downloads, no files to lose.</p>
      </div>

      {books.length === 0 && <p className="muted">No books published yet. Check back soon.</p>}

      <div className="shelf-row">
        {books.map((book) => {
          const cover = coverSrc(book);
          const hasDiscount = book.originalPrice > book.price;
          const percentOff = hasDiscount
            ? Math.round(100 - (book.price / book.originalPrice) * 100)
            : 0;
          return (
            <Link
              to={`/books/${book._id}`}
              key={book._id}
              className="book-card"
              style={{ "--shelf-color": shelfColor(book._id) }}
            >
              <div className="book-card-cover">
                {cover ? (
                  <img src={cover} alt={book.title} />
                ) : (
                  <div className="book-card-cover-placeholder">
                    <span>{book.title?.[0]}</span>
                  </div>
                )}
                {hasDiscount && <span className="book-card-discount-flag">-{percentOff}%</span>}
              </div>

              <div className="book-card-info">
                <h3>{book.title}</h3>
                {book.author && <p className="muted">by {book.author}</p>}
              </div>

              <div className="book-card-price-tag">
                {hasDiscount && (
                  <span className="book-card-price-original">
                    {book.currency?.toUpperCase()} {book.originalPrice}
                  </span>
                )}
                <span className="book-card-price-current">
                  {book.currency?.toUpperCase()} {book.price}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
