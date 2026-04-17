"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import { loginUser, getUser } from "@/lib/auth-util";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://eventra-platform.onrender.com/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Usually login only requires email and password, but the current UI specifies a Role switch. 
  // We'll keep the Role select in case they need it for demo routing, though real JWT handles it.
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // If already logged in implicitly via localStorage cache
    const user = getUser();
    if (user) {
      window.location.href = user.role === 'organizer' ? '/organizer' : '/';
    } else {
      setIsMounted(true);
    }
  }, [router]);

  if (!isMounted) return <div className="min-h-[70vh]" />; // Prevent flicker

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
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

      if (!data.token) {
        throw new Error("Authentication token missing in response");
      }

      localStorage.setItem("token", data.token);

      // Successful login API call, now retrieve stored metadata if we have cache from register
      const cached = getUser() || {};
      const assignedRole = data.user?.role || role || "student"; // Prefer backend role
      
      // Store using auth-util
      loginUser(
        cached.name || "User",
        email,
        assignedRole,
        cached.rollNumber || "N/A",
        cached.department || "N/A"
      );

      // Dispatch storage event so navbar updates
      window.dispatchEvent(new Event("storage"));
      
      if (assignedRole === "organizer") {
        window.location.href = "/organizer";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-grow items-center justify-center min-h-[70vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-800/80 p-8 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95">
        <div className="text-center flex flex-col items-center">
          <Image src="/logo.png" alt="Eventra Logo" width={80} height={80} className="mb-4 rounded-full shadow-lg shadow-black/40" />
          <h2 className="text-4xl font-extrabold text-white tracking-tight">Sign in to Eventra</h2>
          <p className="mt-3 text-base font-medium text-slate-400">Enter your credentials to continue.</p>
        </div>
        
        {error && (
          <div className="p-5 my-6 bg-red-900/30 text-red-300 border border-red-800/60 rounded-xl text-base text-center font-bold tracking-wide shadow-sm">
            {error}
          </div>
        )}

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
              className="w-full px-4 py-3.5 border border-slate-700 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-500 bg-slate-800 text-white outline-none font-medium text-base hover:border-slate-600 transition-all cursor-pointer"
            >
              <option value="student">Student</option>
              <option value="organizer">Organizer</option>
            </select>
          </div>

          <Button type="submit" disabled={isLoading} fullWidth>
            {isLoading ? "Signing in..." : "Continue"}
          </Button>

          <div className="text-center text-base font-medium text-slate-400 mt-6">
            Don't have an account? <Link href="/register" className="text-blue-400 font-bold hover:text-blue-300 transition-colors ml-1">Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
