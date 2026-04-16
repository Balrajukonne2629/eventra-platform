"use client";

// Simulated dummy data for participants
const DUMMY_PARTICIPANTS = [
  { id: 1, team: "Team Alpha", members: "Ravi, Kiran" },
  { id: 2, team: "Team Beta", members: "Ajay, Rahul" },
  { id: 3, team: "Code Crafters", members: "Simran, Neha" }
];

export default function ParticipantsList({ event, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10 flex flex-col max-h-[85vh]">
        <div className="px-6 py-5 border-b border-slate-700 flex justify-between items-center bg-slate-900 flex-shrink-0">
          <h3 className="text-2xl font-bold text-white tracking-tight">Participants List</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto">
          <div className="mb-6">
            <h4 className="text-sm uppercase tracking-widest text-emerald-400 font-extrabold mb-2">{event?.title}</h4>
            <p className="text-slate-300 text-lg font-medium">Below is the currently simulated participant sheet for this event:</p>
          </div>

          <table className="min-w-full divide-y divide-slate-700/50 mt-6 border border-slate-700 rounded-xl overflow-hidden shadow-inner">
            <thead className="bg-slate-900/80">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Team Name</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Members</th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700/50">
              {event?.teamSize === 1 ? (
                 DUMMY_PARTICIPANTS.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap text-base font-bold text-white">Individual</td>
                    <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-slate-300">{p.members.split(',')[0]}</td>
                  </tr>
                ))
              ) : (
                DUMMY_PARTICIPANTS.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap text-base font-bold text-white">{p.team}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-slate-300">{p.members}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-5 border-t border-slate-700 bg-slate-900/50 text-right flex-shrink-0">
           <button onClick={onClose} className="px-8 py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-colors shadow-sm ring-1 ring-white/5">
             Close
           </button>
        </div>
      </div>
    </div>
  );
}
