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
          return (
            <Link
              to={`/books/${book._id}`}
              key={book._id}
              className={`book-card ${cover ? "book-card-has-cover" : ""}`}
              style={{ "--shelf-color": shelfColor(book._id) }}
            >
              {cover && (
                <img src={cover} alt="" className="book-card-bg" aria-hidden="true" />
              )}
              <div className="book-card-inner">
                <div>
                  <h3>{book.title}</h3>
                  {book.author && <p className="muted">by {book.author}</p>}
                </div>
                <span className="price">
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
