import Button from "./Button";

export default function EventCard({ event, onActionClick, actionLabel = "Register", isOrganizer = false, onDeleteClick }) {
  const deadlineDate = new Date(event.deadline).toLocaleDateString();
  const deadlineTime = new Date(event.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="surface-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-slate-500/70 flex h-full flex-col">
      <div className="flex flex-grow flex-col gap-3.5">
        <div className="flex justify-between items-start">
          <h3 className="line-clamp-2 text-2xl font-bold leading-tight text-slate-50">{event.title}</h3>
        </div>
        
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-300">{event.club}</p>
        
        <div className="flex gap-2 items-center flex-wrap my-1">
          <span className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap border ${event.category === 'Technical' ? 'bg-blue-500/20 text-blue-200 border-blue-400/30' : 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/30'}`}>
            {event.category}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-[11px] font-semibold tracking-wider uppercase border border-emerald-400/30">
            Faculty Notified
          </span>
        </div>
        
        <p className="mt-1 text-sm text-slate-400">
          Created by <span className="font-semibold text-slate-200">{event.organizer?.name || "Organizer"}</span>
        </p>
        
        <p className="my-1 line-clamp-3 flex-grow text-sm leading-relaxed text-slate-300">
          {event.description}
        </p>
        
        <div className="mt-auto space-y-3 border-t border-slate-700/80 pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Deadline</span>
            <span className="rounded-lg border border-amber-400/30 bg-amber-500/20 px-3 py-1 text-[11px] font-semibold text-amber-100">
              {deadlineDate} - {deadlineTime}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Team Size</span>
            <span className="text-sm font-semibold text-slate-200">{event.teamSize === 1 ? 'Individual' : `${event.teamSize} Members`}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 space-y-2">
        <Button
          onClick={() => onActionClick(event)}
          fullWidth
          variant={isOrganizer ? "secondary" : "primary"}
          className={isOrganizer ? "text-emerald-200" : ""}
        >
          {actionLabel}
        </Button>

        {isOrganizer && onDeleteClick && (
          <Button
            onClick={() => onDeleteClick(event)}
            fullWidth
            variant="danger"
          >
            Delete Event
          </Button>
        )}
      </div>
    </div>
  );
}
