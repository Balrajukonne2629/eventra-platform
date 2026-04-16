export default function EventCard({ event, onActionClick, actionLabel = "Register", isOrganizer = false }) {
  const deadlineDate = new Date(event.deadline).toLocaleDateString();
  const deadlineTime = new Date(event.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 hover:shadow-2xl hover:scale-[1.02] transform transition-all duration-300 flex flex-col h-full ring-1 ring-white/5 disabled:opacity-50">
      <div className="flex-grow flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <h3 className="text-2xl font-bold text-white line-clamp-2 title-shadow leading-tight tracking-tight">{event.title}</h3>
        </div>
        
        <p className="text-base font-semibold text-blue-400 tracking-wide">{event.club}</p>
        
        <div className="flex gap-2 items-center flex-wrap my-1">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap border ${event.category === 'Technical' ? 'bg-blue-900/40 text-blue-300 border-blue-800' : 'bg-purple-900/40 text-purple-300 border-purple-800'}`}>
            {event.category}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-900/30 text-emerald-400 text-xs font-bold tracking-wider uppercase border border-emerald-800 shadow-sm">
            📧 Faculty Notified
          </span>
        </div>
        
        <p className="text-sm text-slate-400 mt-2">
          Created by: <span className="font-bold text-slate-200">{event.organizer?.name || "Organizer"}</span>
        </p>
        
        <p className="text-slate-300 font-medium text-base line-clamp-3 my-2 flex-grow leading-relaxed">
          {event.description}
        </p>
        
        <div className="space-y-4 text-sm border-t border-slate-700 pt-5 mt-auto">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">Deadline</span>
            <span className="bg-orange-900/30 text-orange-400 px-3 py-1.5 rounded-lg border border-orange-800/60 font-bold text-xs shadow-sm">
              {deadlineDate} - {deadlineTime}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">Team Size</span>
            <span className="font-bold text-slate-200">{event.teamSize === 1 ? 'Individual' : `${event.teamSize} Members`}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <button 
          onClick={() => onActionClick(event)}
          className={`w-full py-3.5 rounded-xl font-bold text-base transition-all shadow-lg transform hover:-translate-y-0.5 border ${isOrganizer ? 'bg-slate-700 text-emerald-400 border-slate-600 hover:bg-slate-600 hover:text-emerald-300' : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500 hover:shadow-blue-500/20'}`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
