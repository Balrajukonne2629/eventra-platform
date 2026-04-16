export default function Alert({ type = "success", message }) {
  if (!message) return null;

  const isSuccess = type === "success";
  const bgColor = isSuccess ? "bg-emerald-900/30" : "bg-red-900/30";
  const borderCol = isSuccess ? "border-emerald-800/60" : "border-red-800/60";
  const textCol = isSuccess ? "text-emerald-400" : "text-red-300";
  const shadowInfo = isSuccess ? "shadow-emerald-900/20" : "shadow-red-900/20";
  const icon = isSuccess ? "✅" : "❌";

  return (
    <div className={`p-5 my-6 rounded-xl border flex items-center gap-4 shadow-sm ${shadowInfo} ${bgColor} ${borderCol} ${textCol} animate-in fade-in slide-in-from-top-2`}>
      <span className="text-2xl">{icon}</span>
      <p className="font-bold tracking-wide text-base">{message}</p>
    </div>
  );
}
