import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("checking");
  const [error, setError] = useState("");
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
            <p className="muted">
              <Link to="/login">Back to log in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}