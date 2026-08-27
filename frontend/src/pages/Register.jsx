import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
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
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                value={form.password}
                onChange={update("password")}
                required
                minLength={6}
              />
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