import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function EyeIcon({ off }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {off ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

function PasswordInput({ placeholder, value, onChange, minLength, autoComplete }) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: "relative", display: "flex" }}>
      <input
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        style={{ width: "100%", paddingRight: 46 }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        title={visible ? "Hide password" : "Show password"}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: 42,
          margin: 0,
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "none",
          boxShadow: "none",
          color: "var(--text-muted)",
        }}
      >
        <EyeIcon off={visible} />
      </button>
    </div>
  );
}

const MISMATCH_MESSAGE = "Passwords do not match";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  function clearMismatchError() {
    setError((prev) => (prev === MISMATCH_MESSAGE ? "" : prev));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== confirmPassword) {
      setError(MISMATCH_MESSAGE);
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", form);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  // Live hint while typing (hidden once the submit error is already showing)
  const mismatch = confirmPassword.length > 0 && form.password !== confirmPassword && !error;

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <span className="eyebrow">New here?</span>
        <h2>Get your card</h2>
        <p>Create an account to buy books and read them anytime, on any device.</p>
      </div>
      <div className="auth-page">
        <h2>Create an account</h2>
        {done ? (
          <p className="notice success">
            Account created — check <strong>{form.email}</strong> for a verification link
            before logging in. (Check your spam folder if it doesn't arrive in a minute or two.)
          </p>
        ) : (
          <>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
              <input placeholder="Full name" value={form.name} onChange={update("name")} required />
              <input type="email" placeholder="Email" value={form.email} onChange={update("email")} required />
              <PasswordInput
                placeholder="Password (min 6 chars)"
                value={form.password}
                onChange={(e) => {
                  update("password")(e);
                  clearMismatchError();
                }}
                minLength={6}
                autoComplete="new-password"
              />
              <PasswordInput
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearMismatchError();
                }}
                minLength={6}
                autoComplete="new-password"
              />
              {mismatch && (
                <p style={{ margin: "-4px 0 0", fontSize: "0.82rem", color: "var(--brick)" }}>
                  {MISMATCH_MESSAGE}
                </p>
              )}
              <button type="submit" disabled={loading}>
                {loading ? "Creating…" : "Register"}
              </button>
            </form>
          </>
        )}
        <p className="muted">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
