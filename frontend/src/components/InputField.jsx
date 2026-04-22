export default function InputField({ label, type = "text", name, value, onChange, placeholder, required = false, isTextArea = false, disabled = false, className = "" }) {
  const commonClasses = `w-full rounded-xl border px-4 py-3 text-sm transition-all outline-none ${
    disabled
      ? "border-slate-700 bg-slate-900/70 text-slate-500 placeholder-slate-600 cursor-not-allowed"
      : "border-slate-600/80 bg-slate-900/85 text-slate-100 placeholder-slate-500 hover:border-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/35"
  } ${className}`;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-200 tracking-wide">
        {label} {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {isTextArea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={4}
          className={`${commonClasses} min-h-[124px] resize-y`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={commonClasses}
        />
      )}
    </div>
  );
}
