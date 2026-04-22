"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import Alert from "@/components/Alert";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // If already authenticated, redirect away from login page
  useEffect(() => {
    if (!authLoading && user) {
      const dest = user.role === "organizer" ? "/organizer" : "/";
      router.replace(dest);
    }
  }, [user, authLoading, router]);

  if (authLoading) return <div className="min-h-[70vh]" />;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // login() returns the full user object from /me
      const me = await login({ email, password });
      setSuccess("Welcome back! Redirecting to your dashboard…");

      // Role-based redirect — determined by backend JWT, not UI selector
      const dest = me?.role === "organizer" ? "/organizer" : "/";
      setTimeout(() => {
        router.replace(dest);
      }, 600);
    } catch (err) {
      const msg = String(err?.message || "Login failed").toLowerCase();
      if (
        msg.includes("unauthorized") ||
        msg.includes("invalid credentials") ||
        msg.includes("not authenticated")
      ) {
        setError("Incorrect email or password. Please try again.");
      } else {
        setError("Unable to sign in right now. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[72vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="surface-card w-full max-w-md animate-in fade-in zoom-in-95 space-y-8 rounded-2xl p-8">
        <div className="text-center flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Eventra Logo"
            width={80}
            height={80}
            className="mb-4 rounded-full shadow-lg shadow-black/40 ring-1 ring-white/10"
          />
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-50">
            Sign in to Eventra
          </h2>
          <p className="mt-3 text-base font-medium text-slate-400">
            Enter your credentials to continue.
          </p>
        </div>

        {success && <Alert type="success" message={success} />}
        {error && <Alert type="error" message={error} />}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <InputField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@college.edu"
            required
          />
          <InputField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button type="submit" disabled={isLoading} loading={isLoading} fullWidth>
            {isLoading ? "Signing in…" : "Continue"}
          </Button>

          <div className="mt-6 text-center text-base font-medium text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="ml-1 font-semibold text-blue-300 transition-colors hover:text-blue-200"
            >
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
