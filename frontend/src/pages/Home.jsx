import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { shelfColor } from "../lib/shelfColor";

const API_BASE = import.meta.env.VITE_API_URL;
function coverSrc(book) {
  return book.coverImage ? `${API_BASE}/books/${book._id}/cover` : null;
}

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/books")
      .then((res) => setBooks(res.data))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ---------- HERO: photo on left, about section on right ---------- */}
      <section className="home-hero-v2">
        <div className="home-hero-v2-inner">
          <div className="home-hero-v2-photo">
            <img src="/images/author-abdul-waheed.jpg" alt="Prof. Dr. Abdul Waheed" />
          </div>
          <div className="home-hero-v2-content">
            <span className="eyebrow">Prof. Dr. Abdul Waheed · University of Karachi</span>
            <h1>About the author</h1>
            <p>
              Professor of Economics at the University of Karachi, with a PhD from
              Nagoya University, Japan, under a Japanese Government Fellowship.
              Over two decades of university teaching, published research, and
              hands-on SPSS &amp; EViews work — brought together in these textbooks
              on statistics and research methods for business and economics
              students.
            </p>
            <div className="home-hero-actions">
              <Link to="/books" className="btn-primary">Browse the books</Link>
              <Link to="/about" className="btn-ghost">Full profile</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="page">
        {/* ---------- BOOKS, ONE BY ONE: cover + buy now under it, preface beside ---------- */}
        <section className="home-section">
          <span className="eyebrow">On the shelf</span>
          <h2>The books</h2>

          {loading && <p className="state-line">Loading books…</p>}
          {!loading && books.length === 0 && (
            <p className="muted">No books published yet. Check back soon.</p>
          )}

          {!loading && books.length > 0 && (
            <div className="book-showcase-list">
              {books.map((book) => (
                <article
                  className="book-showcase-row"
                  key={book._id}
                  style={{ "--shelf-color": shelfColor(book._id) }}
                >
                  <div className="book-showcase-cover-col">
                    <div className="book-showcase-cover">
                      {coverSrc(book) ? (
                        <img src={coverSrc(book)} alt={book.title} />
                      ) : (
                        <div className="book-showcase-cover-placeholder">
                          <span>{book.title?.[0]}</span>
                        </div>
                      )}
                    </div>
                    <Link to={`/books/${book._id}`} className="btn-primary book-showcase-buy">
                      Buy now
                    </Link>
                  </div>

                  <div className="book-showcase-body">
                    <h3>{book.title}</h3>
                    {book.author && <p className="muted book-showcase-author">by {book.author}</p>}
                    <span className="price">
                      {book.currency?.toUpperCase()} {book.price}
                    </span>
                    {book.description && (
                      <p className="book-showcase-desc">{book.description}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ---------- LIBRARY PROMO ---------- */}
        <section className="home-section library-promo">
          <div className="library-promo-inner">
            <div>
              <span className="eyebrow">Your shelf, anywhere</span>
              <h2>Everything you buy lives in My Library</h2>
              <p>
                No downloads, no lost files — every book you purchase opens straight
                in your browser, ready whenever you are.
              </p>
            </div>
            <Link to="/library" className="btn-primary">Go to my library</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
