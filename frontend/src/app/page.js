"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEvents, getMyRegistrations } from "@/lib/api";
import EventCard from "@/components/EventCard";
import RegisterModal from "@/components/RegisterModal";
import Loader from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import Alert from "@/components/Alert";
import InputField from "@/components/InputField";

export default function StudentDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState("");
  const [registrationCount, setRegistrationCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [clubFilter, setClubFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [clubOptions, setClubOptions] = useState([]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

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

    async function fetchInitialData() {
      const [allEventsResp, myRegistrationsResp] = await Promise.all([getEvents(), getMyRegistrations()]);

      if (allEventsResp.success) {
        const options = Array.from(new Set((allEventsResp.data || []).map((ev) => ev.club).filter(Boolean))).sort((a, b) => a.localeCompare(b));
        setClubOptions(options);
      }

      if (myRegistrationsResp.success) {
        setRegistrationCount(Array.isArray(myRegistrationsResp.data) ? myRegistrationsResp.data.length : 0);
      }
    }

    fetchInitialData();
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'student') return;

    async function fetchFilteredEvents() {
      setError("");
      setIsLoading(true);

      const eventsResp = await getEvents({
        search: debouncedSearch,
        club: clubFilter,
        category: categoryFilter,
      });

      if (eventsResp.success) {
        setEvents(eventsResp.data);
      } else {
        setEvents([]);
        setError(eventsResp.message || "Failed to load events");
      }

      setIsLoading(false);
    }

    fetchFilteredEvents();
  }, [authLoading, user, debouncedSearch, clubFilter, categoryFilter]);

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

  const NoResultsState = () => (
    <div className="surface-card flex flex-col items-center justify-center space-y-4 rounded-2xl p-10 text-center">
      <div className="rounded-full border border-slate-600/80 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200">No results found</div>
      <p className="text-sm leading-relaxed text-slate-400">Try changing your search term or filters.</p>
    </div>
  );

  const hasActiveFilters = Boolean(debouncedSearch.trim() || clubFilter || categoryFilter);

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
        <p className="mt-3 text-center text-sm font-semibold text-cyan-200 sm:text-left">
          You registered for {registrationCount} events
        </p>
      </div>

      {error ? (
        <Alert type="error" message={error} />
      ) : (
        <div className="space-y-14">
          <section className="surface-card rounded-2xl p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <InputField
                label="Search Events"
                name="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title"
              />

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold tracking-wide text-slate-200">Club</label>
                <select
                  value={clubFilter}
                  onChange={(e) => setClubFilter(e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-slate-600/80 bg-slate-900/85 px-4 py-3 text-sm font-medium text-slate-100 outline-none transition-all hover:border-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/35"
                >
                  <option value="">All Clubs</option>
                  {clubOptions.map((club) => (
                    <option key={club} value={club}>{club}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold tracking-wide text-slate-200">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-slate-600/80 bg-slate-900/85 px-4 py-3 text-sm font-medium text-slate-100 outline-none transition-all hover:border-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/35"
                >
                  <option value="">All Categories</option>
                  <option value="Technical">Technical</option>
                  <option value="Non-Technical">Non-Technical</option>
                </select>
              </div>
            </div>
          </section>

          {events.length === 0 ? (
            hasActiveFilters ? <NoResultsState /> : <EmptyState />
          ) : (
            <>
              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">Closing Soon</h2>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Sorted by deadline</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {closingSoon.map(ev => (
                    <EventCard key={ev._id} event={ev} onActionClick={setSelectedEvent} actionLabel="Register" />
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">Newly Added</h2>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Fresh arrivals</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newlyAdded.map(ev => (
                  <EventCard key={ev._id} event={ev} onActionClick={setSelectedEvent} actionLabel="Register" />
                ))}
              </div>
            </section>
            </>
          )}
      </div>
      )}

      {selectedEvent && (
        <RegisterModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
