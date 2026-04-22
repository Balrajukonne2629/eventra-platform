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
        const res = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          if (active) setUser(null);
          if (!PUBLIC_ROUTES.has(pathname)) {
            router.replace("/login");
          }
          return;
        }

        const data = await res.json();
        if (active) {
          setUser(data?.user || null);
        }
      } catch {
        localStorage.removeItem("token");
        if (active) setUser(null);
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
    logout: () => {
      localStorage.removeItem("token");
      setUser(null);
      router.replace("/login");
    },
  }), [user, isLoading, router]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
