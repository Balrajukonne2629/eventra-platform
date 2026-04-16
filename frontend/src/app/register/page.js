"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import InputField from "@/components/InputField";
import Button from "@/components/Button";

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

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Registration failed");
      }

      // Store in localStorage directly after successful register 
      // We leverage the standard object to hold names/departments seamlessly until official login.
      localStorage.setItem("eventra_user", JSON.stringify({
        name: formData.name || "User",
        email: formData.email,
        role: formData.role,
        rollNumber: formData.rollNumber || "N/A",
        department: formData.department || "N/A"
      }));

      // Redirect to login page
      router.push("/login");
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
          <h2 className="text-4xl font-extrabold text-white tracking-tight">Create an Account</h2>
          <p className="mt-3 text-base font-medium text-slate-400">Join Eventra to manage and discover events.</p>
        </div>
        
        {error && (
          <div className="p-5 my-6 bg-red-900/30 text-red-300 border border-red-800/60 rounded-xl text-base text-center font-bold tracking-wide shadow-sm">
            {error}
          </div>
        )}

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
              className="w-full px-4 py-3.5 border border-slate-700 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-500 bg-slate-800 text-white outline-none font-medium text-base hover:border-slate-600 transition-all cursor-pointer"
            >
              <option value="student">Student</option>
              <option value="organizer">Organizer</option>
            </select>
          </div>

          <Button type="submit" disabled={isLoading} fullWidth>
            {isLoading ? "Creating Account..." : "Register"}
          </Button>

          <div className="text-center text-base font-medium text-slate-400 mt-6">
            Already have an account? <Link href="/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors ml-1">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
