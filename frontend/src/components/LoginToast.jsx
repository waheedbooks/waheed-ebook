import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const SHOW_FOR_MS = 4500; // how long the popup stays before it closes by itself
const EXIT_MS = 300; // length of the closing animation

// The "you're logged in" popup. Appears after a successful login, closes by itself,
// pauses while the mouse is over it, and can be closed with the X button or the Esc key.
export default function LoginToast() {
  const { welcome, dismissWelcome } = useAuth();
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const remainingRef = useRef(SHOW_FOR_MS);

  // a new login: start the countdown again
  useEffect(() => {
    if (!welcome) return;
    remainingRef.current = SHOW_FOR_MS;
    setLeaving(false);
    setPaused(false);
  }, [welcome]);

  // countdown (stops while paused, and carries on with the time that is left)
  useEffect(() => {
    if (!welcome || paused || leaving) return undefined;
    const startedAt = Date.now();
    const timer = setTimeout(() => setLeaving(true), remainingRef.current);
    return () => {
      clearTimeout(timer);
      remainingRef.current -= Date.now() - startedAt;
    };
  }, [welcome, paused, leaving]);

  // after the closing animation, remove it completely
  useEffect(() => {
    if (!leaving) return undefined;
    const timer = setTimeout(dismissWelcome, EXIT_MS);
    return () => clearTimeout(timer);
  }, [leaving, dismissWelcome]);

  // Esc closes it
  useEffect(() => {
    if (!welcome) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setLeaving(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [welcome]);

  if (!welcome) return null;

  const fullName = (welcome.name || "").trim().replace(/\s+/g, " ");

  return (
    <div className="login-toast-wrap">
      <div
        key={welcome.id}
        className={`login-toast${leaving ? " is-leaving" : ""}${paused ? " is-paused" : ""}`}
        role="status"
        aria-live="polite"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <span className="login-toast-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path className="login-toast-tick" d="M5.5 12.8l4.2 4.2L18.5 8" />
          </svg>
        </span>
        <div className="login-toast-body">
          <strong>You’re logged in</strong>
          <span>
            {welcome.isNew
              ? `Welcome${fullName ? `, ${fullName}` : ""}. Your account is verified.`
              : `Welcome back${fullName ? `, ${fullName}` : ""}.`}
          </span>
        </div>
        <button
          type="button"
          className="login-toast-close"
          aria-label="Close notification"
          onClick={() => setLeaving(true)}
        >
          ×
        </button>
        <span className="login-toast-bar" style={{ animationDuration: `${SHOW_FOR_MS}ms` }} />
      </div>
    </div>
  );
}
