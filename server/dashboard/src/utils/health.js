export function healthColor(value) {
  if (value === null || value === undefined) return "bg-slate-600";
  if (value <= 30) return "bg-red-500";
  if (value <= 60) return "bg-amber-400";
  return "bg-emerald-400";
}
