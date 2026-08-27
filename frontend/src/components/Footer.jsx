import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand footer-brand-name">The Reading Room</span>
          <p>
            Textbooks by Prof. Dr. Abdul Waheed, Professor of Economics at the
            University of Karachi — read online, no downloads needed.
          </p>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/books">Browse books</Link></li>
            <li><Link to="/about">About the author</Link></li>
            <li><Link to="/library">My library</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Author</h4>
          <ul>
            <li>
              <a href="http://waheedku.com" target="_blank" rel="noreferrer noopener">
                waheedku.com
              </a>
            </li>
            <li><Link to="/about">Credentials &amp; research</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} The Reading Room. All rights reserved.</span>
      </div>
    </footer>
  );
}
