import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

/* ── Storage helpers ──────────────────────────────────────────
   "Remember me" = localStorage  (persists after closing browser)
   No remember me = sessionStorage (cleared when tab is closed)
   ─────────────────────────────────────────────────────────── */
const TOKEN_KEY = "rl_token";
const USER_KEY  = "rl_user";

const getStore = () =>
  localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;

const saveAuth = (token, user, remember) => {
  const store = remember ? localStorage : sessionStorage;
  store.setItem(TOKEN_KEY, token);
  store.setItem(USER_KEY, JSON.stringify(user));
};

const loadToken = () =>
  localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

const loadUser = () => {
  try {
    const raw =
      localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const clearAuth = () => {
  [localStorage, sessionStorage].forEach((s) => {
    s.removeItem(TOKEN_KEY);
    s.removeItem(USER_KEY);
  });
};

/* ── JWT expiry check (client-side) ──────────────────────────
   Decodes the JWT payload (no verification — just peeking at exp).
   The server still validates on every request; this is just for UX.
   ─────────────────────────────────────────────────────────── */
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

/* ══════════════════════════════════════════════════════════════
   AuthProvider
══════════════════════════════════════════════════════════════ */
export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Rehydrate from storage on mount ── */
  useEffect(() => {
    const stored = loadToken();
    if (stored && !isTokenExpired(stored)) {
      setToken(stored);
      setUser(loadUser());
    } else if (stored) {
      // Token was saved but has expired — clean up silently
      clearAuth();
    }
    setLoading(false);
  }, []);

  /* ── Auto-logout when token expires ──
     Checks every 60 s. When the token is
     within 60 s of expiry the user is logged
     out and shown a friendly toast.           */
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      if (isTokenExpired(token)) {
        clearAuth();
        setToken(null);
        setUser(null);
        toast.error("Session expired — please log in again 🔒");
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [token]);

  /* ── Register ── */
  const register = async (userData) => {
    try {
      const { data } = await authAPI.register(userData);
      saveAuth(data.token, data.user, false); // don't remember by default on register
      setToken(data.token);
      setUser(data.user);
      toast.success("Welcome to RoomieLink! 🎉");
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  /* ── Login ──
     Accepts a `remember` boolean from the login form.
     When true: token goes to localStorage (survives browser close).
     When false: sessionStorage only.                               */
 const login = async (credentials, remember = false) => {
  try {
    const { data } = await authAPI.login(credentials);
    
    // 🔥 CRITICAL FIX: Clear BOTH storages before saving new data
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    
    // Save to the correct storage
    const store = remember ? localStorage : sessionStorage;
    store.setItem(TOKEN_KEY, data.token);
    store.setItem(USER_KEY, JSON.stringify(data.user));
    
    setToken(data.token);
    setUser(data.user);
    toast.success("Welcome back! 👋");
    return { success: true };
  } catch (err) {
    const msg = err.response?.data?.message || "Login failed";
    toast.error(msg);
    return { success: false, error: msg };
  }
};

  /* ── Logout ── */
  const logout = () => {
  // Clear both storages
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  
  setToken(null);
  setUser(null);
  toast.success("Logged out — see you soon! 👋");
};

  /* ── Update local user cache (e.g. after profile edit) ── */
  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    getStore().setItem(USER_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !isTokenExpired(token),
        register,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};