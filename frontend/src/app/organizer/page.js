"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEvent, getEvents, getParticipants } from "@/lib/api";
import EventCard from "@/components/EventCard";
import ParticipantsList from "@/components/ParticipantsList";
import Loader from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import Alert from "@/components/Alert";

export default function OrganizerDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (user.role !== 'organizer') {
      window.location.href = "/";
      return;
    }

    async function fetchAll() {
      const organizerId = user?._id || user?.id;
      const resp = await getEvents({ organizerId });
      if (resp.success) {
        setEvents(resp.data);
      } else {
        setError(resp.message || 'Failed to load events');
      }
      setIsLoading(false);
    }
    fetchAll();
  }, [authLoading, user, router]);

  if (authLoading || !user || isLoading) {
    return <Loader text="Loading workspace..." fullScreen />;
  }

  const handleViewParticipants = async (event) => {
    setSelectedEvent(event);
    setParticipants([]);
    setParticipantsLoading(true);

    const resp = await getParticipants(event._id);
    if (resp.success && Array.isArray(resp.data)) {
      setParticipants(resp.data);
    } else {
      setParticipants([]);
    }

    setParticipantsLoading(false);
  };

  const handleDeleteEvent = async (event) => {
    const shouldDelete = window.confirm(`Delete "${event.title}"? This action cannot be undone.`);
    if (!shouldDelete) return;

    const resp = await deleteEvent(event._id);
    if (!resp.success) {
      setError(resp.message || 'Failed to delete event');
      return;
    }

    setEvents((prev) => prev.filter((ev) => ev._id !== event._id));
    setSuccess(`Deleted ${event.title}.`);
  };

  const EmptyState = () => (
    <div className="surface-card flex flex-col items-center justify-center space-y-4 rounded-2xl p-10 text-center">
      <div className="rounded-full border border-slate-600/80 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200">No events yet</div>
      <p className="text-lg font-semibold text-slate-50">No supervised events available.</p>
      <p className="max-w-md text-sm leading-relaxed text-slate-400">Create an event to start tracking participants and registration activity.</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl animate-in fade-in duration-500">
      <div className="mb-12 rounded-3xl border border-slate-700/70 bg-slate-950/35 p-6 shadow-lg sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title text-4xl font-extrabold sm:text-6xl">
            Welcome, <span className="text-emerald-400">{user.name}</span>!
          </h1>
          <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm font-semibold text-slate-200 sm:justify-start">
            <span className="rounded-xl border border-slate-600/80 bg-slate-900/80 px-4 py-2">Roll No: {user.rollNumber}</span>
            <span className="rounded-xl border border-slate-600/80 bg-slate-900/80 px-4 py-2">Dept: {user.department}</span>
            <span className="rounded-xl border border-slate-600/80 bg-slate-900/80 px-4 py-2">Events: {events.length}</span>
          </div>
          <p className="muted-copy mt-6 max-w-2xl text-center text-lg leading-relaxed sm:text-left sm:text-2xl">
            Manage your created events and track participants safely.
          </p>
        </div>
        
        <button onClick={() => router.push('/create-event')} className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-6 py-3 text-sm font-semibold text-emerald-100 transition-all hover:border-emerald-300/50 hover:bg-emerald-500/25 hover:text-white sm:px-8 sm:py-4 sm:text-base">
          + Create Event
        </button>
      </div>
      </div>

      {error ? (
        <Alert type="error" message={error} />
      ) : success ? (
        <Alert type="success" message={success} />
      ) : null}

      {events.length === 0 && !error ? (
        <EmptyState />
      ) : (
        <section className="space-y-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">My Supervised Events</h2>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Live data</span>
          </div>
          {events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(ev => (
              <EventCard 
                key={ev._id} 
                event={ev} 
                onActionClick={handleViewParticipants} 
                onDeleteClick={handleDeleteEvent}
                actionLabel="View Participants" 
                isOrganizer 
              />
            ))}
          </div>
          )}
        </section>
      )}

      {selectedEvent && (
        <ParticipantsList
          event={selectedEvent}
          participants={participants}
          isLoading={participantsLoading}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
