"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-700/80 bg-slate-950/75 shadow-[0_8px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between py-3">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tight text-white transition-transform hover:scale-[1.02]">
              <Image src="/logo.png" alt="Eventra Logo" width={40} height={40} className="rounded-full shadow-lg shadow-black/30 ring-1 ring-white/10" />
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Eventra</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href={user?.role === 'organizer' ? '/organizer' : '/'} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white sm:px-4">
              Home
            </Link>
            
            {user?.role === 'organizer' && (
              <Link href="/create-event" className="inline-flex items-center gap-1 rounded-xl border border-blue-400/30 bg-blue-500/15 px-4 py-2 text-sm font-semibold text-blue-100 transition-all hover:border-blue-300/50 hover:bg-blue-500/25 hover:text-white">
                Create Event
              </Link>
            )}

            {user ? (
               <button onClick={handleLogout} className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition-colors hover:border-rose-300/40 hover:bg-rose-500/20 hover:text-white">
                 Logout
               </button>
            ) : (
               <Link href="/login" className="rounded-xl border border-slate-600 bg-slate-800/80 px-5 py-2 text-sm font-semibold text-slate-100 shadow-sm transition-colors hover:border-slate-500 hover:bg-slate-700 sm:text-base">
                 Login
               </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
