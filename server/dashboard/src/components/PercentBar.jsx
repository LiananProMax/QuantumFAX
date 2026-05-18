import { healthColor } from "../utils/health";

function PercentBar({ label, value, compact = false }) {
  const safeValue = value === null || value === undefined ? 0 : value;

  return (
    <div className={compact ? "space-y-1" : "space-y-1.5"}>
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>{label}</span>
        <span>{value === null || value === undefined ? "-" : `${value}%`}</span>
      </div>
      <div className={`${compact ? "h-1.5" : "h-2"} overflow-hidden rounded-full bg-slate-800`}>
        <div
          className={`h-full rounded-full transition-all ${healthColor(value)}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

export default PercentBar;
