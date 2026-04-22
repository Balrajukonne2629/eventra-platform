"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import Alert from "@/components/Alert";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { user, isLoading: authLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Usually login only requires email and password, but the current UI specifies a Role switch. 
  // We'll keep the Role select in case they need it for demo routing, though real JWT handles it.
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      window.location.href = '/';
    }
  }, [user]);

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
      await login({ email, password });
      setSuccess("Welcome back. Redirecting to your dashboard...");

      setTimeout(() => {
        window.location.href = "/";
      }, 700);
    } catch (err) {
      const msg = String(err?.message || "Login failed").toLowerCase();
      if (msg.includes("unauthorized") || msg.includes("invalid credentials") || msg.includes("not authenticated")) {
        setError("Please login first");
      } else {
        setError("Unable to login right now. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[72vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="surface-card w-full max-w-md animate-in fade-in zoom-in-95 space-y-8 rounded-2xl p-8">
        <div className="text-center flex flex-col items-center">
          <Image src="/logo.png" alt="Eventra Logo" width={80} height={80} className="mb-4 rounded-full shadow-lg shadow-black/40 ring-1 ring-white/10" />
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-50">Sign in to Eventra</h2>
          <p className="mt-3 text-base font-medium text-slate-400">Enter your credentials to continue.</p>
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
          
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-bold text-slate-300 tracking-wide">Login As</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full cursor-pointer rounded-xl border border-slate-600/80 bg-slate-900/85 px-4 py-3 text-sm font-medium text-slate-100 outline-none transition-all hover:border-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/35"
            >
              <option value="student">Student</option>
              <option value="organizer">Organizer</option>
            </select>
          </div>

            <Button type="submit" disabled={isLoading} loading={isLoading} fullWidth>
            {isLoading ? "Signing in..." : "Continue"}
          </Button>

            <div className="mt-6 text-center text-base font-medium text-slate-400">
              Don't have an account? <Link href="/register" className="ml-1 font-semibold text-blue-300 transition-colors hover:text-blue-200">Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
