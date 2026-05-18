function StatCard({ label, value, tone = "slate" }) {
  const toneClass = {
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    red: "text-red-300",
    blue: "text-blue-300",
    slate: "text-slate-100"
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/75 px-4 py-3 shadow-lg shadow-black/20">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`mt-1 text-2xl font-semibold leading-none ${toneClass}`}>{value}</div>
    </div>
  );
}

export default StatCard;
