"use client";
import { useState, useEffect } from "react";
import InputField from "./InputField";
import Button from "./Button";
import Alert from "./Alert";
import { getUser } from "@/lib/auth-util";

const existingTeams = ["Alpha", "Beta", "Gamma"];

export default function RegisterModal({ event, onClose }) {
  const [teamName, setTeamName] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState({ name: "", rollNumber: "" });

  useEffect(() => {
    const activeUser = getUser();
    if (activeUser) setUser(activeUser);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (event?.teamSize > 1) {
      // Check for duplicate team name
      if (existingTeams.includes(teamName.trim())) {
        setError("❌ Team name already exists");
        return;
      }
      
      existingTeams.push(teamName.trim());
    }

    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2000); // Close after 2 seconds
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
        <div className="px-6 py-5 border-b border-slate-700 flex justify-between items-center bg-slate-900">
          <h3 className="text-2xl font-bold text-white tracking-tight">Register for Event</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-8">
          <div className="mb-8 p-5 bg-blue-900/40 text-blue-200 rounded-xl text-base font-medium border border-blue-800/60 shadow-inner">
            You are registering for <span className="font-extrabold text-white">{event?.title}</span>.
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/30 text-red-300 border border-red-800/50 rounded-lg font-bold text-base text-center">
              {error}
            </div>
          )}

          {success ? (
            <Alert type="success" message="✅ Registered Successfully" />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField 
                label="Student Name" 
                value={user.name} 
                onChange={() => {}} // simulated frozen
                placeholder="Your Name"
                disabled 
              />
              <InputField 
                label="Roll Number" 
                value={user.rollNumber} 
                onChange={() => {}} 
                placeholder="Your Roll Number"
                disabled 
              />
              
              {event?.teamSize > 1 && (
                <div className="mt-2">
                  <InputField 
                    label="Team Name" 
                    value={teamName} 
                    onChange={(e) => setTeamName(e.target.value)} 
                    placeholder="e.g. Alpha Squad"
                    required 
                  />
                  <p className="mt-2 text-sm text-slate-400 font-medium italic">*Use same team name to join an existing team</p>
                </div>
              )}
              
              <div className="pt-6 mt-8 border-t border-slate-700 flex space-x-4">
                <Button type="submit" fullWidth>Confirm</Button>
                <button type="button" onClick={onClose} className="px-8 py-4 border border-slate-600 rounded-xl text-slate-300 font-bold hover:bg-slate-700 hover:text-white transition-all flex-grow shadow-sm">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
