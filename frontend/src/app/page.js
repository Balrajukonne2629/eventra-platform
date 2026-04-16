"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth-util";
import { getEvents } from "@/lib/api";
import EventCard from "@/components/EventCard";
import RegisterModal from "@/components/RegisterModal";
import Loader from "@/components/Loader";

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const activeUser = getUser();
    if (!activeUser) {
      window.location.href = "/login";
      return;
    }
    if (activeUser.role !== 'student') {
      window.location.href = "/organizer";
      return;
    }
    setUser(activeUser);

    async function fetchAll() {
      const resp = await getEvents();
      if (resp.success) {
        setEvents(resp.data);
      } else {
        setError(true);
      }
      setIsLoading(false);
    }
    fetchAll();
  }, [router]);

  if (!user || isLoading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><Loader text="Loading Dashboard..." /></div>;
  }

  // Sort logic for Student display
  const newlyAdded = [...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
  const closingSoon = [...events].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 4);

  const EmptyState = () => (
    <div className="bg-slate-800/80 rounded-2xl border border-slate-600 p-10 text-center flex flex-col items-center justify-center space-y-4 shadow-lg ring-1 ring-white/5">
      <p className="text-white font-bold text-xl tracking-wide">No events available right now.</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-14 text-center sm:text-left">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white title-shadow">
          Welcome, <span className="text-blue-400">{user.name}</span>!
        </h1>
        <div className="mt-5 text-lg text-slate-200 font-bold flex justify-center sm:justify-start gap-6">
          <span className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-600 shadow-sm ring-1 ring-white/5">Roll No: {user.rollNumber}</span>
          <span className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-600 shadow-sm ring-1 ring-white/5">Dept: {user.department}</span>
        </div>
        <p className="mt-6 text-2xl font-medium text-slate-300 max-w-2xl leading-relaxed">
          Discover and register for the latest events happening on campus.
        </p>
      </div>

      {error ? (
        <div className="p-5 mb-8 rounded-xl border flex items-center gap-4 shadow-sm bg-red-900/20 border-red-800/50 text-red-200">
          <span className="text-2xl">❌</span>
          <p className="font-semibold text-lg">Failed to load events</p>
        </div>
      ) : (
        <div className="space-y-16">
          <section>
            <h2 className="text-3xl font-extrabold text-white mb-8 border-b border-slate-700/80 pb-4 shadow-sm inline-block w-full">Closing Soon</h2>
            {closingSoon.length === 0 ? <EmptyState /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {closingSoon.map(ev => (
                  <EventCard key={ev._id} event={ev} onActionClick={setSelectedEvent} actionLabel="Register" />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-3xl font-extrabold text-white mb-8 border-b border-slate-700/80 pb-4 shadow-sm inline-block w-full">Newly Added</h2>
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
