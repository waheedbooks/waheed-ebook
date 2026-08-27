import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);
    setResendStatus("idle");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      if (err.response?.data?.needsVerification) setNeedsVerification(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendStatus("sending");
    try {
      await api.post("/auth/resend-verification", { email });
      setResendStatus("sent");
    } catch {
      setResendStatus("idle");
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <span className="eyebrow">Member access</span>
        <h2>Welcome back</h2>
        <p>Your purchased books are waiting in your library, exactly where you left them.</p>
      </div>
      <div className="auth-page">
        <h2>Log in</h2>
        {error && <p className="error">{error}</p>}
        {needsVerification && (
          <p className="muted" style={{ marginTop: -6, marginBottom: 14 }}>
            {resendStatus === "sent" ? (
              "A new verification link has been sent — check your inbox."
            ) : (
              <>
                Didn't get the email?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendStatus === "sending"}
                  className="link-more"
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                >
                  {resendStatus === "sending" ? "Sending…" : "Resend verification link"}
                </button>
              </>
            )}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? "Logging in…" : "Log in"}</button>
        </form>
        <p className="muted" style={{ marginTop: 10 }}>
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
        <p className="muted">No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}