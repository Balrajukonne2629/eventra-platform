"use client";

import Loader from "./Loader";

export default function ParticipantsList({ event, participants = [], isLoading = false, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in">
      <div className="surface-card flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl">
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-700/80 bg-slate-950/70 px-6 py-5">
          <div>
            <h3 className="text-2xl font-bold text-slate-50">Participants</h3>
            <p className="mt-1 text-sm text-slate-400">Registered teams for {event?.title}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white" aria-label="Close participants modal">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="overflow-y-auto p-6 sm:p-8">
          <div className="mb-6 rounded-2xl border border-slate-700/80 bg-slate-900/60 p-5">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Live registrations</h4>
            <p className="mt-2 text-lg font-medium text-slate-200">{event?.title}</p>
          </div>

          <table className="mt-6 min-w-full overflow-hidden rounded-xl border border-slate-700/70 shadow-inner">
            <thead className="bg-slate-950/80">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">Team Name</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">Members</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 bg-slate-900/55">
              {isLoading && (
                <tr>
                  <td className="px-6 py-8" colSpan={2}><Loader text="Loading participants..." /></td>
                </tr>
              )}

              {!isLoading && participants.length === 0 && (
                <tr>
                  <td className="px-6 py-8" colSpan={2}>
                    <div className="rounded-xl border border-dashed border-slate-600 bg-slate-950/40 px-5 py-7 text-center">
                      <p className="text-base font-semibold text-slate-100">No participants registered yet.</p>
                      <p className="mt-1 text-sm text-slate-400">When teams register, they will appear here automatically.</p>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && participants.map((registration) => {
                const memberNames = (registration.members || [])
                  .map((member) => member?.name || member?.email || 'Unknown')
                  .join(', ');

                return (
                  <tr key={registration._id} className="transition-colors hover:bg-white/5">
                    <td className="whitespace-nowrap px-6 py-5 text-sm font-semibold text-slate-50">{registration.teamName}</td>
                    <td className="px-6 py-5 text-sm text-slate-300">{memberNames || 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="flex flex-shrink-0 justify-end border-t border-slate-700/80 bg-slate-950/70 px-6 py-5">
           <button onClick={onClose} className="rounded-xl border border-slate-600 bg-slate-800 px-5 py-2.5 font-semibold text-slate-100 transition-colors hover:border-slate-500 hover:bg-slate-700">
             Close
           </button>
        </div>
      </div>
    </div>
  );
}
