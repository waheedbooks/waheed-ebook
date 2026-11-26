import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const RESEND_SECONDS = 60;

const linkButtonStyle = { background: "none", border: "none", padding: 0, cursor: "pointer" };

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("password");
  const [pin, setPin] = useState("");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const { login, showWelcome, sessionNotice, clearSessionNotice } = useAuth();
  const navigate = useNavigate();

  // Count down before "Send a new PIN" can be used again
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function finishLogin(data) {
    login(data.token, data.user);
    showWelcome(data.user?.name);
    navigate("/");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);
    setResendStatus("idle");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.pinRequired) {
        clearSessionNotice();
        setPin("");
        setInfo(res.data.message || "");
        setCooldown(RESEND_SECONDS);
        setStep("pin");
      } else {
        finishLogin(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      if (err.response?.data?.needsVerification) setNeedsVerification(true);
    } finally {
      setLoading(false);
    }
  }

  async function handlePinSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-login-pin", { email, pin });
      finishLogin(res.data);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || "Could not verify the PIN");
      setPin("");
      // The PIN is no longer usable: go back so a new one can be requested.
      if (data?.pinExpired) setStep("password");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendPin() {
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.token) {
        finishLogin(res.data);
        return;
      }
      setPin("");
      setInfo(res.data.message || "A new PIN has been sent to your email.");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send a new PIN");
    } finally {
      setLoading(false);
    }
  }

  function backToPassword() {
    setStep("password");
    setPin("");
    setError("");
    setInfo("");
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

  const onPinStep = step === "pin";

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <span className="eyebrow">{onPinStep ? "Two-step login" : "Member access"}</span>
        <h2>{onPinStep ? "Check your email" : "Welcome back"}</h2>
        <p>
          {onPinStep
            ? "For your security we emailed you a 6-digit PIN. Enter it to finish logging in."
            : "Your purchased books are waiting in your library, exactly where you left them."}
        </p>
      </div>
      <div className="auth-page">
        {onPinStep ? (
          <>
            <h2>Enter your PIN</h2>
            {info && !error && <p className="notice success">{info}</p>}
            {error && <p className="error">{error}</p>}
            <form onSubmit={handlePinSubmit}>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="6-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                autoFocus
                style={{ letterSpacing: "0.4em", fontSize: "1.3rem", textAlign: "center" }}
              />
              <button type="submit" disabled={loading || pin.length !== 6}>
                {loading ? "Checking…" : "Verify and log in"}
              </button>
            </form>
            <p className="muted" style={{ marginTop: 10 }}>
              Didn't get it? Check your spam folder.{" "}
              {cooldown > 0 ? (
                `You can ask for a new PIN in ${cooldown}s.`
              ) : (
                <button
                  type="button"
                  onClick={handleResendPin}
                  disabled={loading}
                  className="link-more"
                  style={linkButtonStyle}
                >
                  Send a new PIN
                </button>
              )}
            </p>
            <p className="muted">
              <button
                type="button"
                onClick={backToPassword}
                className="link-more"
                style={linkButtonStyle}
              >
                Back to log in
              </button>
            </p>
          </>
        ) : (
          <>
            <h2>Log in</h2>
            {sessionNotice && <p className="notice">{sessionNotice}</p>}
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
                      style={linkButtonStyle}
                    >
                      {resendStatus === "sending" ? "Sending…" : "Resend verification link"}
                    </button>
                  </>
                )}
              </p>
            )}
            <form onSubmit={handleSubmit}>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <div style={{ position: "relative", display: "flex" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ width: "100%", paddingRight: 46 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  title={showPassword ? "Hide password" : "Show password"}
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
                    {showPassword ? (
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
                </button>
              </div>
              <button type="submit" disabled={loading}>{loading ? "Logging in…" : "Log in"}</button>
            </form>
            <p className="muted" style={{ marginTop: 10 }}>
              <Link to="/forgot-password">Forgot password?</Link>
            </p>
            <p className="muted">No account? <Link to="/register">Register</Link></p>
          </>
        )}
      </div>
    </div>
  );
}
