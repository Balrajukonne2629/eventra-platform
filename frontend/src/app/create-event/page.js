"use client";
import EventForm from "@/components/EventForm";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

export default function CreateEventPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
    } else if (user.role !== "organizer") {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  // Show loader while auth state is resolving or if not yet authorized
  if (authLoading || !user || user.role !== "organizer") {
    return <Loader text="Loading event composer…" fullScreen />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 rounded-3xl border border-slate-700/70 bg-slate-950/35 p-6 shadow-lg sm:p-8">
        <h1 className="page-title text-4xl font-extrabold sm:text-5xl">Propose an Event</h1>
        <p className="muted-copy mt-4 text-lg sm:text-xl">
          Fill out the details below to notify the faculty and get your event rolling!
        </p>
      </div>

      <EventForm />
    </div>
  );
}
