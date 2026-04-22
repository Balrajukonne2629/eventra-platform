"use client";

export function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

export function hasToken() {
  return Boolean(getToken());
}

export function logoutUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}
