export default function Button({ children, onClick, type = "button", disabled = false, fullWidth = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative inline-flex items-center justify-center font-bold text-white transition-all rounded-xl shadow-lg
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
        ${fullWidth ? 'w-full px-6 py-4 text-lg tracking-wide' : 'px-6 py-3.5 text-base tracking-wide'} 
        ${disabled 
          ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600' 
          : 'bg-blue-600 border border-blue-500 hover:bg-blue-500 hover:shadow-blue-500/25 transform hover:-translate-y-0.5 focus:ring-blue-400'
        }
      `}
    >
      {children}
    </button>
  );
}
