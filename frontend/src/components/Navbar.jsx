"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUser, logoutUser } from '@/lib/auth-util';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // Read from storage on load
  useEffect(() => {
    setUser(getUser());
    
    // Listen to changes 
    const handleStorage = () => setUser(getUser());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold text-white hover:scale-105 transition-transform tracking-tight">
              <Image src="/logo.png" alt="Eventra Logo" width={40} height={40} className="shadow-md rounded-full shadow-black/20" />
              <span>Eventra</span>
            </Link>
          </div>
          <div className="flex space-x-3 sm:space-x-5 items-center">
            <Link href={user?.role === 'organizer' ? '/organizer' : '/'} className="text-slate-300 hover:text-white font-semibold px-3 py-2 transition-colors text-sm sm:text-base">
              Home
            </Link>
            
            {user?.role === 'organizer' && (
              <Link href="/create-event" className="bg-blue-600 text-white hover:bg-blue-500 font-bold px-4 md:px-5 py-2 md:py-2.5 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 text-sm sm:text-base flex items-center gap-1">
                <span>Create Event</span>
              </Link>
            )}

            {user ? (
               <button onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 font-bold px-4 py-2 rounded-xl transition-colors text-sm sm:text-base border border-transparent hover:border-red-400/20">
                 Logout
               </button>
            ) : (
               <Link href="/login" className="bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 font-semibold px-5 py-2 rounded-xl shadow-sm transition-colors text-sm sm:text-base">
                 Login
               </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
