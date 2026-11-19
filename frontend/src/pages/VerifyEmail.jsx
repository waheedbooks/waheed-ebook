import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("checking");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [resendStatus, setResendStatus] = useState("idle");
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .post(`/auth/verify-email/${token}`)
      .then((res) => {
        login(res.data.token, res.data.user);
        setStatus("done");
        setTimeout(() => navigate("/"), 1500);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Could not verify this link.");
        setStatus("failed");
      });
  }, [token]);

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <span className="eyebrow">Account verification</span>
        <h2>Verifying your email</h2>
        <p>Just a moment while we confirm this link.</p>
      </div>
      <div className="auth-page">
        {status === "checking" && <p className="state-line">Verifying…</p>}
        {status === "done" && (
          <p className="notice success">Email verified! Taking you in…</p>
        )}
        {status === "failed" && (
          <>
            <p className="error">{error}</p>
            {resendStatus === "sent" ? (
              <p className="notice success">
                If that account needs verifying, a new link has been sent — check your inbox.
              </p>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setResendStatus("sending");
                  try {
                    await api.post("/auth/resend-verification", { email });
                    setResendStatus("sent");
                  } catch {
                    setResendStatus("idle");
                  }
                }}
              >
                <p className="muted">Enter your email and we'll send you a new link.</p>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" disabled={resendStatus === "sending"}>
                  {resendStatus === "sending" ? "Sending…" : "Send a new verification link"}
                </button>
              </form>
            )}
            <p className="muted">
              <Link to="/login">Back to log in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
