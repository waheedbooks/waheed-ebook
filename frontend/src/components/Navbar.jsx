import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand" onClick={closeMenu}>Waheed Books</Link>

      <button
        className="nav-toggle"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}>
        <Link to="/" onClick={closeMenu}>Home</Link>
        <Link to="/books" onClick={closeMenu}>Books</Link>
        <Link to="/about" onClick={closeMenu}>About the Author</Link>
        {user && <Link to="/library" onClick={closeMenu}>My Library</Link>}
        {user?.role === "admin" && <Link to="/admin" onClick={closeMenu}>Admin</Link>}
        {user ? (
          <>
            <span className="nav-user">{user.name}</span>
            <button
              onClick={() => {
                logout();
                closeMenu();
                navigate("/");
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={closeMenu}>Log in</Link>
            <Link to="/register" onClick={closeMenu}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
