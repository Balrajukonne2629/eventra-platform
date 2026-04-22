"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEvents } from "@/lib/api";
import EventCard from "@/components/EventCard";
import RegisterModal from "@/components/RegisterModal";
import Loader from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import Alert from "@/components/Alert";

export default function StudentDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (user.role !== 'student') {
      window.location.href = "/organizer";
      return;
    }

    async function fetchAll() {
      const resp = await getEvents();
      if (resp.success) {
        setEvents(resp.data);
      } else {
        setError(resp.message || "Failed to load events");
      }
      setIsLoading(false);
    }
    fetchAll();
  }, [authLoading, user, router]);

  if (authLoading || !user || isLoading) {
    return <Loader text="Loading dashboard..." fullScreen />;
  }

  // Sort logic for Student display
  const newlyAdded = [...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
  const closingSoon = [...events].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 4);

  const EmptyState = () => (
    <div className="surface-card flex flex-col items-center justify-center space-y-4 rounded-2xl p-10 text-center">
      <div className="rounded-full border border-slate-600/80 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200">No events yet</div>
      <p className="text-lg font-semibold text-slate-50">No events available right now.</p>
      <p className="max-w-md text-sm leading-relaxed text-slate-400">Check back soon or refresh when organizers publish new opportunities.</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl animate-in fade-in duration-500">
      <div className="mb-12 rounded-3xl border border-slate-700/70 bg-slate-950/35 p-6 shadow-lg sm:p-8">
        <h1 className="page-title text-center text-4xl font-extrabold sm:text-left sm:text-6xl">
          Welcome, <span className="text-blue-400">{user.name}</span>!
        </h1>
        <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm font-semibold text-slate-200 sm:justify-start">
          <span className="rounded-xl border border-slate-600/80 bg-slate-900/80 px-4 py-2">Roll No: {user.rollNumber}</span>
          <span className="rounded-xl border border-slate-600/80 bg-slate-900/80 px-4 py-2">Dept: {user.department}</span>
        </div>
        <p className="muted-copy mt-6 max-w-2xl text-center text-lg leading-relaxed sm:text-left sm:text-2xl">
          Discover and register for the latest events happening on campus.
        </p>
      </div>

      {error ? (
        <Alert type="error" message={error} />
      ) : (
        <div className="space-y-14">
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">Closing Soon</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Sorted by deadline</span>
            </div>
            {closingSoon.length === 0 ? <EmptyState /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {closingSoon.map(ev => (
                  <EventCard key={ev._id} event={ev} onActionClick={setSelectedEvent} actionLabel="Register" />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">Newly Added</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Fresh arrivals</span>
            </div>
            {newlyAdded.length === 0 ? <EmptyState /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newlyAdded.map(ev => (
                <EventCard key={ev._id} event={ev} onActionClick={setSelectedEvent} actionLabel="Register" />
              ))}
            </div>
          )}
        </section>
      </div>
      )}

      {selectedEvent && (
        <RegisterModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
