import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api";
import { shelfColor } from "../lib/shelfColor";

export default function Library() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const purchaseStatus = searchParams.get("purchase");

  useEffect(() => {
    api
      .get("/payments/my-library")
      .then((res) => setBooks(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (purchaseStatus !== "processing") return;
    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      api
        .get("/payments/my-library")
        .then((res) => setBooks(res.data))
        .catch(() => {});
      if (attempts >= 10) clearInterval(interval);
    }, 3000);
    return () => clearInterval(interval);
  }, [purchaseStatus]);

  return (
    <div className="page">
      {purchaseStatus === "success" && (
        <p className="notice success">
          Payment received! It may take a few seconds to appear below.
        </p>
      )}
      {purchaseStatus === "processing" && (
        <p className="notice">
          Your payment is still being confirmed — this page will update
          automatically once it's done. If your book doesn't appear within a
          minute, refresh this page.
        </p>
      )}
      {purchaseStatus === "failed" && (
        <p className="notice error">
          We couldn't confirm that payment. If money was deducted, it should
          be reversed shortly — otherwise, feel free to try again.
        </p>
      )}

      <div className="page-hero">
        <span className="eyebrow">Your shelf</span>
        <h2>My Library</h2>
        <p>Everything you've bought, ready to read — no downloads needed.</p>
      </div>

      {loading && <p className="state-line">Loading…</p>}
      {!loading && books.length === 0 && (
        <p className="muted">You haven't purchased any books yet. <Link to="/books">Browse books</Link>.</p>
      )}

      <div className="shelf-row">
        {books.filter(Boolean).map((book) => (
          <Link
            to={`/read/${book._id}`}
            key={book._id}
            className="book-card"
            style={{ "--shelf-color": shelfColor(book._id) }}
          >
            <div>
              <h3>{book.title}</h3>
              {book.author && <p className="muted">by {book.author}</p>}
            </div>
            <span className="read-link">Read now</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
