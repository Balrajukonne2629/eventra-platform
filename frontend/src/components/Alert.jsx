export default function Alert({ type = "success", message }) {
  if (!message) return null;

  const isSuccess = type === "success";
  const bgColor = isSuccess ? "bg-emerald-500/12" : "bg-rose-500/12";
  const borderCol = isSuccess ? "border-emerald-400/35" : "border-rose-400/35";
  const textCol = isSuccess ? "text-emerald-200" : "text-rose-200";
  const iconBg = isSuccess ? "bg-emerald-400/20 text-emerald-200" : "bg-rose-400/20 text-rose-200";
  const icon = isSuccess ? "Success" : "Error";

  return (
    <div className={`my-6 flex items-start gap-3 rounded-xl border p-4 ${bgColor} ${borderCol} ${textCol} animate-in fade-in slide-in-from-top-2`}>
      <span className={`rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-wider ${iconBg}`}>{icon}</span>
      <p className="text-sm font-medium leading-relaxed">{message}</p>
    </div>
  );
}
