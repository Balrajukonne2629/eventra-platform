"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyRegistrations } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";
import Alert from "@/components/Alert";

export default function MyEventsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== 'student') {
      router.replace(user.role === 'organizer' ? '/organizer' : '/');
      return;
    }

    async function fetchMyRegistrations() {
      const resp = await getMyRegistrations();
      if (resp.success) {
        setRegistrations(Array.isArray(resp.data) ? resp.data : []);
      } else {
        setError(resp.message || "Failed to load your registrations");
      }
      setIsLoading(false);
    }

    fetchMyRegistrations();
  }, [authLoading, user, router]);

  if (authLoading || !user || isLoading) {
    return <Loader text="Loading your events..." fullScreen />;
  }

  return (
    <div className="mx-auto max-w-5xl animate-in fade-in duration-500">
      <div className="mb-10 rounded-3xl border border-slate-700/70 bg-slate-950/35 p-6 shadow-lg sm:p-8">
        <h1 className="page-title text-4xl font-extrabold sm:text-5xl">My Events</h1>
        <p className="muted-copy mt-4 text-lg sm:text-xl">
          You registered for {registrations.length} events
        </p>
      </div>

      {error && <Alert type="error" message={error} />}

      {!error && registrations.length === 0 && (
        <div className="surface-card flex flex-col items-center justify-center space-y-4 rounded-2xl p-10 text-center">
          <div className="rounded-full border border-slate-600/80 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200">No registrations yet</div>
          <p className="text-sm leading-relaxed text-slate-400">Register for an event to see it here.</p>
        </div>
      )}

      {!error && registrations.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {registrations.map((registration) => {
            const event = registration?.eventId;
            const deadline = event?.deadline ? new Date(event.deadline) : null;
            const deadlineLabel = deadline && !Number.isNaN(deadline.getTime())
              ? `${deadline.toLocaleDateString()} ${deadline.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : "N/A";

            return (
              <div key={registration._id} className="surface-card rounded-2xl border border-slate-700/80 p-6">
                <h2 className="text-2xl font-bold text-slate-50">{event?.title || "Event"}</h2>
                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <p>
                    <span className="font-semibold text-slate-200">Deadline: </span>
                    {deadlineLabel}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-200">Team Name: </span>
                    {registration.teamName}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
