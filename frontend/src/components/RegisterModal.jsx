"use client";
import { useState, useEffect } from "react";
import InputField from "./InputField";
import Button from "./Button";
import Alert from "./Alert";
import { useAuth } from "@/context/AuthContext";
import { registerForEvent } from "@/lib/api";

export default function RegisterModal({ event, onClose }) {
  const { user: activeUser } = useAuth();
  const [teamName, setTeamName] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState({ name: "", rollNumber: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeUser) {
      setUser({
        name: activeUser.name || "",
        rollNumber: activeUser.rollNumber || "",
      });
    }
  }, [activeUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const userId = activeUser?._id || activeUser?.id;
    if (!userId) {
      setError("Please login first");
      return;
    }

    const normalizedTeamName = event?.teamSize > 1
      ? teamName.trim()
      : `${activeUser?.name || "Individual"}-${String(userId).slice(-6)}`;

    if (!normalizedTeamName) {
      setError("Team name is required");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      eventId: event?._id,
      userId,
      teamName: normalizedTeamName,
      members: [userId],
    };

    const response = await registerForEvent(payload);
    if (response.success) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(response.message || "Failed to register for event");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in">
      <div className="surface-card w-full max-w-lg overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-700/80 bg-slate-950/70 px-6 py-5">
          <div>
            <h3 className="text-2xl font-bold text-slate-50">Register for Event</h3>
            <p className="mt-1 text-sm text-slate-400">Confirm your seat before the deadline</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white" aria-label="Close registration modal">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 sm:p-8">
          <div className="mb-6 rounded-2xl border border-blue-400/25 bg-blue-500/10 p-5 text-sm text-blue-100 shadow-inner">
            You are registering for <span className="font-semibold text-white">{event?.title}</span>.
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-100">
              {error}
            </div>
          )}

          {success ? (
            <Alert type="success" message="Registration submitted successfully." />
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
                value={user.rollNumber || "N/A"} 
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
                  <p className="mt-2 text-xs font-medium italic text-slate-400">Use the same team name to join an existing team.</p>
                </div>
              )}
              
              <div className="mt-8 flex gap-3 border-t border-slate-700/80 pt-5">
                <Button type="submit" fullWidth loading={isSubmitting} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Confirm"}
                </Button>
                <Button type="button" variant="ghost" onClick={onClose} fullWidth>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
