"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://eventra-platform.onrender.com/api";
const AUTH_EXPIRED_EVENT = "auth:unauthorized";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const clearAuth = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setUser(null);
    console.debug("[Auth] Cleared token and user state");
  }, []);

  const fetchCurrentUser = useCallback(async (token) => {
    console.debug("[Auth] Fetching /auth/me …");
    const res = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`/me responded with ${res.status}`);
    }

    const data = await res.json();
    // Backend wraps user under data.data (successResponse shape) or data.user
    const userPayload = data?.data || data?.user;
    if (!userPayload) {
      throw new Error("User payload missing in /me response");
    }

    console.debug("[Auth] /me success — user:", userPayload);
    return userPayload;
  }, []);

  // ─── Logout ─────────────────────────────────────────────────────────────────

  const logout = useCallback(
    (shouldRedirect = true) => {
      clearAuth();
      if (shouldRedirect) {
        router.replace("/login");
      }
    },
    [clearAuth, router]
  );

  // ─── Login ──────────────────────────────────────────────────────────────────

  const login = useCallback(
    async ({ email, password }) => {
      console.debug("[Auth] Attempting login for:", email);
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Invalid credentials");
      }

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid JSON response from login endpoint");
      }

      const token = data?.data?.token || data?.token;
      if (!token) {
        throw new Error("Authentication token missing in login response");
      }

      // ① Persist token
      localStorage.setItem("token", token);
      console.debug("[Auth] Token stored");

      // ② Fetch full user profile via /me
      try {
        const me = await fetchCurrentUser(token);
        setUser(me);
        console.debug("[Auth] User set in context — role:", me?.role);
        return me; // caller uses this to do role-based redirect
      } catch (error) {
        console.error("[Auth] /me failed after login — clearing auth", error);
        logout(false);
        throw error;
      }
    },
    [fetchCurrentUser, logout]
  );

  // ─── Bootstrap on app load (runs ONCE on mount) ───────────────────────────

  useEffect(() => {
    let active = true;

    async function bootstrapUser() {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");
      console.debug("[Auth] Bootstrap — token present:", Boolean(token));

      if (!token) {
        if (active) {
          setUser(null);
          setIsLoading(false);
        }
        return; // pages handle their own redirect guards
      }

      try {
        const me = await fetchCurrentUser(token);
        if (active) {
          setUser(me);
        }
      } catch (err) {
        console.error("[Auth] Bootstrap /me failed — clearing auth", err);
        if (active) {
          clearAuth();
          router.replace("/login");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    setIsLoading(true);
    bootstrapUser();

    return () => {
      active = false;
    };
    // Intentionally omit router / pathname — bootstrap must run ONCE on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Global "session expired" event (fired by api.js on 401) ────────────────

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onUnauthorized = () => {
      console.debug("[Auth] Received auth:unauthorized event — logging out");
      clearAuth();
      router.replace("/login");
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, onUnauthorized);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, onUnauthorized);
    };
  }, [clearAuth, router]);

  // ─── Context value ───────────────────────────────────────────────────────────

  const value = useMemo(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
