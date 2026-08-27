import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { shelfColor } from "../lib/shelfColor";

const STATS = [
  { value: "26+", label: "Years teaching business & economics" },
  { value: "44+", label: "Peer-reviewed publications" },
  { value: "5 PhD / 9 MPhil", label: "Research students supervised" },
  { value: "PhD, Nagoya University", label: "Japanese Government Fellowship" },
];

const FEATURES = [
  {
    title: "Written by an economist, not just a statistician",
    body: "Most statistics books are written by statisticians with little grounding in business or economics. These are written by an economist who has spent decades applying these exact methods to real research.",
  },
  {
    title: "Built around SPSS and EViews",
    body: "Every technique is shown with real software output and step-by-step screenshots, so you can reproduce the analysis yourself, not just read about it.",
  },
  {
    title: "Solved examples and self-test MCQs",
    body: "Every concept comes with a fully worked example and multiple-choice questions, so you can check your understanding as you go instead of at the end of the semester.",
  },
  {
    title: "Follows the university syllabus",
    body: "Chapters are sequenced to match the Statistics courses taught in BS Economics, BS Commerce, and BBA programs, so you can study straight through the book alongside your course.",
  },
];

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/books")
      .then((res) => setBooks(res.data.slice(0, 4)))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ---------- HERO ---------- */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <span className="eyebrow">Prof. Dr. Abdul Waheed · University of Karachi</span>
          <h1>Statistics and research methods, taught by someone who does the research.</h1>
          <p>
            Textbooks in statistical analysis and quantitative research methods for
            business and economics students — built from over two decades of
            university teaching, published research, and hands-on SPSS &amp; EViews
            work.
          </p>
          <div className="home-hero-actions">
            <Link to="/books" className="btn-primary">Browse the books</Link>
            <Link to="/about" className="btn-ghost">About the author</Link>
          </div>
        </div>
      </section>

      {/* ---------- STATS ---------- */}
      <section className="home-stats">
        <div className="home-stats-inner">
          {STATS.map((s) => (
            <div className="stat-item" key={s.label}>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="page">
        {/* ---------- WHY THESE BOOKS ---------- */}
        <section className="home-section">
          <span className="eyebrow">Why these books</span>
          <h2>Made for students who actually have to use this later</h2>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- FEATURED BOOKS ---------- */}
        <section className="home-section">
          <div className="section-head-row">
            <div>
              <span className="eyebrow">On the shelf</span>
              <h2>Featured books</h2>
            </div>
            <Link to="/books" className="link-more">See all books →</Link>
          </div>

          {loading && <p className="state-line">Loading books…</p>}
          {!loading && books.length === 0 && (
            <p className="muted">No books published yet. Check back soon.</p>
          )}

          {!loading && books.length > 0 && (
            <div className="shelf-row">
              {books.map((book) => (
                <Link
                  to={`/books/${book._id}`}
                  key={book._id}
                  className="book-card"
                  style={{ "--shelf-color": shelfColor(book._id) }}
                >
                  <div>
                    <h3>{book.title}</h3>
                    {book.author && <p className="muted">by {book.author}</p>}
                  </div>
                  <span className="price">
                    {book.currency?.toUpperCase()} {book.price}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ---------- AUTHOR STRIP ---------- */}
        <section className="home-section author-strip">
          <img
            src="/images/author-abdul-waheed.jpg"
            alt="Prof. Dr. Abdul Waheed"
            className="author-strip-photo"
          />
          <div>
            <span className="eyebrow">The author</span>
            <h2>Prof. Dr. Abdul Waheed</h2>
            <p>
              An economist specializing in international trade, finance, and
              quantitative development analysis, currently Professor of Economics
              at the University of Karachi. He earned his PhD from Nagoya
              University, Japan, under a Japanese Government Fellowship, and has
              also taught at Nagoya University, the University of Bahrain, IBA,
              Bahria University, and IQRA University.
            </p>
            <Link to="/about" className="link-more">Read the full profile →</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
