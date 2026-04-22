export default function Loader({ text = "Loading...", fullScreen = false }) {
  const content = (
    <div className="inline-flex items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-3 shadow-lg">
      <svg className="h-5 w-5 animate-spin text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-85" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      {text && <span className="text-sm font-medium text-slate-200">{text}</span>}
    </div>
  );

  if (fullScreen) {
    return <div className="min-h-[55vh] flex items-center justify-center">{content}</div>;
  }

  return (
    <div className="flex items-center justify-center">{content}</div>
  );
}
