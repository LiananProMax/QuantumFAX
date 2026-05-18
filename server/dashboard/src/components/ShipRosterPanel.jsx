import { formatAge } from "../utils/format";
import PercentBar from "./PercentBar";

function ShipRow({ ship, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(ship.clientId)}
      className={`w-full rounded-2xl border px-3 py-2.5 text-left transition ${
        active
          ? "border-blue-400 bg-blue-950/40 shadow-lg shadow-blue-950/30"
          : "border-slate-800 bg-slate-900/55 hover:border-slate-600"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-100">
            {ship.shipName || ship.shipTypeLabel}
          </div>
          <div className="mt-0.5 truncate font-mono text-[11px] text-slate-500">{ship.clientId}</div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
            ship.online ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-700/60 text-slate-300"
          }`}
        >
          {ship.online ? "在线" : "离线"}
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <PercentBar label="护盾" value={ship.shieldPercent} compact />
        <PercentBar label="装甲" value={ship.armorPercent} compact />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-slate-400">
        <span className="rounded-full bg-slate-800 px-2 py-0.5">{ship.shipTypeLabel}</span>
        <span className="rounded-full bg-slate-800 px-2 py-0.5">上报 {formatAge(ship.ageMs)}</span>
        {ship.damageControlActivated ? (
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-300">已开损控</span>
        ) : null}
      </div>
    </button>
  );
}

function ShipRosterPanel({ ships, selectedClientId, onSelect }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/75 p-4 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">舰船列表</h2>
          <p className="text-xs text-slate-500">点击切换曲线、日志和性能对象</p>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
          {ships.length} 艘
        </span>
      </div>

      {ships.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-500">
          还没有收到舰船上报。请在客户端配置舰船类型和后端地址后启动主循环。
        </div>
      ) : (
        <div className="mt-3 max-h-[calc(100vh-23rem)] min-h-[260px] space-y-2 overflow-y-auto pr-1">
          {ships.map((ship) => (
            <ShipRow
              key={ship.clientId}
              ship={ship}
              active={selectedClientId === ship.clientId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ShipRosterPanel;
