"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import Alert from "@/components/Alert";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://eventra-platform.onrender.com/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    rollNumber: "",
    department: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError("Name, email, and password are required.");
      return;
    }
    
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          rollNumber: formData.rollNumber.trim() || undefined,
          department: formData.department.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Registration failed");
      }

      try {
        await res.json();
      } catch {
        throw new Error("Invalid JSON response (HTML returned)");
      }

      // Redirect to login page
      setSuccess("Account created successfully. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 700);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[72vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="surface-card w-full max-w-md animate-in fade-in zoom-in-95 space-y-8 rounded-2xl p-8">
        <div className="text-center flex flex-col items-center">
          <Image src="/logo.png" alt="Eventra Logo" width={80} height={80} className="mb-4 rounded-full shadow-lg shadow-black/40 ring-1 ring-white/10" />
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-50">Create an Account</h2>
          <p className="mt-3 text-base font-medium text-slate-400">Join Eventra to manage and discover events.</p>
        </div>
        
        {success && <Alert type="success" message={success} />}
        {error && <Alert type="error" message={error} />}

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <InputField 
            label="Full Name" 
            name="name"
            value={formData.name} 
            onChange={handleChange} 
            placeholder="e.g. Rahul Kumar"
            required 
          />
          <InputField 
            label="Email Address" 
            name="email"
            type="email"
            value={formData.email} 
            onChange={handleChange} 
            placeholder="you@college.edu"
            required 
          />
          <InputField 
            label="Password" 
            name="password"
            type="password"
            value={formData.password} 
            onChange={handleChange} 
            placeholder="••••••••"
            required 
          />
          <InputField 
            label="Roll Number (Optional)" 
            name="rollNumber"
            value={formData.rollNumber} 
            onChange={handleChange} 
            placeholder="e.g. 160121733001"
          />
          <InputField 
            label="Department (Optional)" 
            name="department"
            value={formData.department} 
            onChange={handleChange} 
            placeholder="e.g. CSE"
          />
          
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-bold text-slate-300 tracking-wide">Select Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full cursor-pointer rounded-xl border border-slate-600/80 bg-slate-900/85 px-4 py-3 text-sm font-medium text-slate-100 outline-none transition-all hover:border-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/35"
            >
              <option value="student">Student</option>
              <option value="organizer">Organizer</option>
            </select>
          </div>

            <Button type="submit" disabled={isLoading} loading={isLoading} fullWidth>
            {isLoading ? "Creating Account..." : "Register"}
          </Button>

            <div className="mt-6 text-center text-base font-medium text-slate-400">
              Already have an account? <Link href="/login" className="ml-1 font-semibold text-blue-300 transition-colors hover:text-blue-200">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
