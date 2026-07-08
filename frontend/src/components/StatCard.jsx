const TONE_CLASS = {
  slate: "text-moto-white",
  red: "text-moto-red-light",
  emerald: "text-emerald-400",
  amber: "text-amber-400"
};

export default function StatCard({ icon: Icon, label, value, hint, tone = "slate", className = "", children }) {
  return (
    <div className={`bg-moto-black-soft p-5 rounded-3xl border border-white/10 shadow-sm text-left flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-moto-gray block font-bold uppercase tracking-wider">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-moto-gray shrink-0" />}
      </div>
      {children ?? (
        <>
          <span className={`text-2xl font-black mt-1 block font-mono ${TONE_CLASS[tone] || TONE_CLASS.slate}`}>{value}</span>
          {hint && <span className="text-[10px] text-moto-gray-light mt-0.5 block">{hint}</span>}
        </>
      )}
    </div>
  );
}
