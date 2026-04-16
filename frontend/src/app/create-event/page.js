"use client";
import EventForm from "@/components/EventForm";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth-util";

export default function CreateEventPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      window.location.href = "/login";
    } else if (user.role !== "organizer") {
      window.location.href = "/";
    } else {
      setIsAuth(true);
    }
  }, [router]);

  if (!isAuth) return <div className="min-h-[50vh]" />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Propose an Event
        </h1>
        <p className="mt-4 text-xl text-slate-300">
          Fill out the details below to notify the faculty and get your event rolling!
        </p>
      </div>
      
      <EventForm />
    </div>
  );
}
