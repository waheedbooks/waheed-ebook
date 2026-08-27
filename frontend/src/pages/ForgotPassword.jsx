import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setStatus("loading");
    try {
      await api.post("/auth/forgot-password", { email });
      setStatus("done");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <span className="eyebrow">Account recovery</span>
        <h2>Forgot your password?</h2>
        <p>Enter the email you registered with and we'll send you a reset link.</p>
      </div>
      <div className="auth-page">
        <h2>Reset password</h2>
        {status === "done" ? (
          <p className="notice success">
            If an account exists for that email, a reset link is on its way. Check your inbox
            (and spam folder).
          </p>
        ) : (
          <>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Sending…" : "Send reset link"}
              </button>
            </form>
          </>
        )}
        <p className="muted">
          Remembered it? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
