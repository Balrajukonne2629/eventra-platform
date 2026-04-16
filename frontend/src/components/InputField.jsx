export default function InputField({ label, type = "text", name, value, onChange, placeholder, required = false, isTextArea = false }) {
  const commonClasses = "w-full px-4 py-3.5 border border-slate-700 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-800 text-white placeholder-slate-500 outline-none hover:border-slate-600 font-medium text-base";

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-bold text-slate-300 tracking-wide">
        {label} {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {isTextArea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={4}
          className={`${commonClasses} resize-y min-h-[120px]`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={commonClasses}
        />
      )}
    </div>
  );
}
