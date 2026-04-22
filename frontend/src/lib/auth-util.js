"use client";

/**
 * Reads the JWT from localStorage safely (SSR-compatible).
 * Used by lib/api.js to attach Authorization headers.
 * All logout logic lives in AuthContext — do NOT call localStorage.removeItem here.
 */
export function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

export function hasToken() {
  return Boolean(getToken());
}
