import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import CanvasPdfViewer from "../components/CanvasPdfViewer";

export default function Reader() {
  const { id } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);
  const [loadingBook, setLoadingBook] = useState(true);

  const [accessGranted, setAccessGranted] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);

  const [activeChapterId, setActiveChapterId] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [loadingChapter, setLoadingChapter] = useState(false);

  useEffect(() => {
    setLoadingBook(true);
    setError("");
    api
      .get(`/books/${id}`)
      .then((res) => {
        setBook(res.data);
        if (!res.data.hasPdf) {
          const chapters = res.data?.chapters;
          if (Array.isArray(chapters) && chapters.length > 0 && chapters[0]?.id) {
            setActiveChapterId(chapters[0].id);
          } else {
            setError("This book doesn't have any chapters available yet.");
          }
        }
      })
      .catch((err) => {
        console.error("Reader: failed to load book.", err);
        setError(err.response?.data?.message || "Book not found");
      })
      .finally(() => setLoadingBook(false));
  }, [id]);

  useEffect(() => {
    if (!book?.hasPdf) return;
    setCheckingAccess(true);
    setForbidden(false);
    setError("");
    api
      .head(`/books/${id}/pdf`)
      .then(() => setAccessGranted(true))
      .catch((err) => {
        console.error("Reader: PDF access check failed.", err);
        if (err.response?.status === 403) setForbidden(true);
        else setError("Could not load this book's file. Please try again.");
      })
      .finally(() => setCheckingAccess(false));
  }, [id, book?.hasPdf]);

  useEffect(() => {
    if (!activeChapterId || book?.hasPdf) return;
    setLoadingChapter(true);
    setForbidden(false);
    setError("");
    api
      .get(`/books/${id}/chapters/${activeChapterId}`)
      .then((res) => setChapter(res.data))
      .catch((err) => {
        console.error("Reader: failed to load chapter.", err);
        if (err.response?.status === 403) setForbidden(true);
        else setError(err.response?.data?.message || "Could not load chapter content");
      })
      .finally(() => setLoadingChapter(false));
  }, [id, activeChapterId, book?.hasPdf]);

  const blockCopy = useCallback((e) => e.preventDefault(), []);
  const blockKeys = useCallback((e) => {
    const key = e.key?.toLowerCase();
    const blockedCombo = (e.ctrlKey || e.metaKey) && ["c", "p", "s", "u"].includes(key);
    if (blockedCombo || key === "printscreen") e.preventDefault();
  }, []);

  useEffect(() => {
    document.addEventListener("contextmenu", blockCopy);
    document.addEventListener("copy", blockCopy);
    document.addEventListener("cut", blockCopy);
    document.addEventListener("dragstart", blockCopy);
    document.addEventListener("keydown", blockKeys);
    return () => {
      document.removeEventListener("contextmenu", blockCopy);
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("cut", blockCopy);
      document.removeEventListener("dragstart", blockCopy);
      document.removeEventListener("keydown", blockKeys);
    };
  }, [blockCopy, blockKeys]);

  if (loadingBook) return <p className="state-line">Loading…</p>;
  if (error && !book) return <p className="state-line error">{error}</p>;
  if (!book) return <p className="state-line error">Something went wrong loading this book.</p>;

  if (forbidden) {
    return (
      <div className="page">
        <div className="notice">
          <p style={{ margin: "0 0 6px" }}>You need to purchase this book to read it.</p>
          <Link to={`/books/${id}`}>Go to purchase page</Link>
        </div>
      </div>
    );
  }

  if (book.hasPdf) {
    const token = localStorage.getItem("token");
    const fileUrl = `${api.defaults.baseURL}/books/${id}/pdf`;

    return (
      <div className="pdf-reader">
        <div className="pdf-reader-bar">
          <Link to={`/books/${id}`} className="pdf-reader-back">
            ← {book.title}
          </Link>
        </div>
        <div className="pdf-reader-frame">
          {checkingAccess && <p className="state-line">Loading book…</p>}
          {!checkingAccess && error && <p className="state-line error">{error}</p>}
          {!checkingAccess && !error && accessGranted && (
            <CanvasPdfViewer
              fileUrl={fileUrl}
              authToken={token}
              watermarkLines={[user?.name, user?.email].filter(Boolean)}
            />
          )}
        </div>
      </div>
    );
  }

  const hasChapters = Array.isArray(book.chapters) && book.chapters.length > 0;

  return (
    <div className="reader-layout">
      <aside className="reader-sidebar">
        <span className="eyebrow">Contents</span>
        <h4>{book.title}</h4>
        <ul>
          {hasChapters ? (
            book.chapters.map((c) => (
              <li key={c.id || c.title}>
                <button
                  className={c.id === activeChapterId ? "active" : ""}
                  onClick={() => setActiveChapterId(c.id)}
                >
                  {c.title}
                </button>
              </li>
            ))
          ) : (
            <li className="muted">No chapters yet.</li>
          )}
        </ul>
      </aside>

      <main className="reader-content no-select">
        {!hasChapters && (
          <p className="muted">
            This book doesn't have any readable chapters yet. Please check back later.
          </p>
        )}
        {hasChapters && loadingChapter && <p className="muted">Loading chapter…</p>}
        {hasChapters && !loadingChapter && error && <p className="error">{error}</p>}
        {hasChapters && !loadingChapter && !error && !chapter && (
          <p className="muted">Select a chapter from the left to start reading.</p>
        )}
        {hasChapters && !loadingChapter && chapter && (
          <div className="watermarked">
            <div className="watermark-overlay" aria-hidden="true">
              {Array.from({ length: 30 }).map((_, i) => (
                <span key={i}>
                  {chapter.viewer?.name || ""} · {chapter.viewer?.email || ""}
                </span>
              ))}
            </div>
            <h2>{chapter.title}</h2>
            <div className="chapter-text">
              {(chapter.content || "").split("\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
