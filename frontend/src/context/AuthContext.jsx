"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://eventra-platform.onrender.com/api";
const PUBLIC_ROUTES = new Set(["/login", "/register"]);

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const fetchCurrentUser = async (token) => {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch current user");
    }

    const data = await res.json();
    const userPayload = data?.data?.user || data?.user;
    if (!userPayload) {
      throw new Error("User payload missing");
    }

    return userPayload;
  };

  const logout = (shouldRedirect = true) => {
    clearAuth();
    if (shouldRedirect) {
      router.replace("/login");
    }
  };

  const login = async ({ email, password }) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Invalid credentials");
    }

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error("Invalid JSON response (HTML returned)");
    }

    const token = data?.data?.token || data?.token;
    if (!token) {
      throw new Error("Authentication token missing in response");
    }

    // Persist only token; user profile is sourced from /auth/me
    localStorage.setItem("token", token);

    try {
      const me = await fetchCurrentUser(token);
      setUser(me);
      return me;
    } catch (error) {
      logout(false);
      throw error;
    }
  };

  useEffect(() => {
    let active = true;

    async function bootstrapUser() {
      const token = localStorage.getItem("token");

      if (!token) {
        if (active) {
          setUser(null);
          setIsLoading(false);
        }
        if (!PUBLIC_ROUTES.has(pathname)) {
          router.replace("/login");
        }
        return;
      }

      try {
        const me = await fetchCurrentUser(token);
        if (active) setUser(me);
      } catch {
        logout(false);
        if (!PUBLIC_ROUTES.has(pathname)) {
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
  }, [pathname, router]);

  const value = useMemo(() => ({
    user,
    isLoading,
    setUser,
    login,
    logout,
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
