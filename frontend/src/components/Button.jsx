export default function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  fullWidth = false,
  loading = false,
  variant = "primary",
  className = "",
}) {
  const isDisabled = disabled || loading;

  const variantClasses = {
    primary: "bg-blue-500 text-white border border-blue-400/80 hover:bg-blue-400 hover:shadow-[0_8px_24px_rgba(47,123,246,0.35)]",
    secondary: "bg-slate-700 text-slate-100 border border-slate-500/70 hover:bg-slate-600",
    danger: "bg-rose-700/80 text-rose-100 border border-rose-500/70 hover:bg-rose-600/80",
    ghost: "bg-transparent text-slate-200 border border-slate-500/50 hover:bg-slate-700/50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-wide
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300/70 focus:ring-offset-2 focus:ring-offset-slate-950
        ${fullWidth ? "w-full px-6 py-3.5 text-base" : "px-5 py-2.5 text-sm"}
        ${isDisabled ? "cursor-not-allowed border border-slate-700 bg-slate-800 text-slate-500" : "-translate-y-0 hover:-translate-y-0.5"}
        ${!isDisabled ? variantClasses[variant] || variantClasses.primary : ""}
        ${className}
      `}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-35" />
          <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
}
