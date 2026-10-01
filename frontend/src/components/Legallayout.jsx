import { useEffect } from "react";
import "../legal.css";

export default function LegalLayout({ title, updated, children }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page legal-page">
      <span className="eyebrow">Legal &amp; support</span>
      <h1>{title}</h1>
      {updated && <p className="legal-updated">Last updated: {updated}</p>}
      {children}
    </div>
  );
}
