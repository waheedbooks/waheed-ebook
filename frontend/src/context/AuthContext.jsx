import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const AuthContext = createContext(null);

// How often a logged-in browser asks the server "is my session still valid?"
// This is what logs an old device out soon after the account is used elsewhere.
const SESSION_CHECK_MS = 60 * 1000;

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const [welcome, setWelcome] = useState(null);
  const [sessionNotice, setSessionNotice] = useState("");
  const startedRef = useRef(false);

  const showWelcome = useCallback((name, isNew = false) => {
    setWelcome({ id: Date.now(), name: name || "", isNew });
  }, []);
  const dismissWelcome = useCallback(() => setWelcome(null), []);
  const clearSessionNotice = useCallback(() => setSessionNotice(""), []);

  // The server said this session is over (signed in on another device, or 2 days passed).
  useEffect(() => {
    function onSessionEnded(e) {
      setUser(null);
      setWelcome(null);
      setSessionNotice(e.detail?.message || "Your session has ended. Please log in again.");
      // Only jump to the login page once the app is up and running (not on first page load).
      if (startedRef.current) navigate("/login", { replace: true });
    }
    window.addEventListener("auth:session-ended", onSessionEnded);
    return () => window.removeEventListener("auth:session-ended", onSessionEnded);
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      startedRef.current = true;
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => {
        setLoading(false);
        startedRef.current = true;
      });
  }, []);

  // While logged in, re-check the session every minute and whenever the tab is
  // opened again. A 401 answer logs this device out automatically.
  const loggedIn = !!user;
  useEffect(() => {
    if (!loggedIn) return undefined;
    const check = () => {
      if (localStorage.getItem("token")) api.get("/auth/me").catch(() => {});
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    const timer = setInterval(check, SESSION_CHECK_MS);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loggedIn]);

  function login(token, userData) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setSessionNotice("");
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setWelcome(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        welcome,
        showWelcome,
        dismissWelcome,
        sessionNotice,
        clearSessionNotice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
