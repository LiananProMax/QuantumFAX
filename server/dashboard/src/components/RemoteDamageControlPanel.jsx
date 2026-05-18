import { formatAge, formatTime } from "../utils/format";

function formatSeconds(ms) {
  return Math.round((Number(ms) || 0) / 1000);
}

function RemoteDamageControlPanel({ status, error, updating, onToggle }) {
  const enabled = status?.enabled === true;
  const currentCommand = status?.currentCommand || null;
  const eligibleShips = status?.eligibleShips || [];
  const activeShips = status?.activeShips || [];
  const availableShips = status?.availableShips || [];
  const cooldownShips = status?.cooldownShips || [];
  const unknownShips = status?.unknownShips || [];
  const nextActionAt = status?.nextActionAt || null;
  const requiredCount = status?.requiredForContinuousCoverage || 5;

  function renderShipNames(ships) {
    if (!ships || ships.length === 0) {
      return "无";
    }
    return ships
      .slice(0, 3)
      .map((ship) => ship.shipName || ship.shipTypeLabel || ship.clientId)
      .join("、") + (ships.length > 3 ? ` 等 ${ships.length} 艘` : "");
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/75 p-4 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">远程损害管控</h2>
          <p className="mt-1 text-xs text-slate-500">
            使徒 / 特勒马科斯轮流开启，激活 {formatSeconds(status?.activationDurationMs || 30000)} 秒，重启延迟{" "}
            {formatSeconds(status?.reactivationDelayMs || 120000)} 秒。
          </p>
        </div>
        <button
          type="button"
          disabled={updating}
          onClick={() => onToggle(!enabled)}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
            enabled
              ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          {updating ? "保存中" : enabled ? "已开启" : "已关闭"}
        </button>
      </div>

      {error ? (
        <div className="mt-3 rounded-xl border border-red-500/30 bg-red-950/30 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-slate-900/70 px-3 py-2">
          <div className="text-slate-500">可参与在线舰船</div>
          <div className="mt-1 text-lg font-semibold text-white">
            {status?.eligibleCount ?? 0}
            <span className="ml-1 text-xs font-normal text-slate-500">/ {requiredCount} 无缝</span>
          </div>
        </div>
        <div className="rounded-xl bg-slate-900/70 px-3 py-2">
          <div className="text-slate-500">调度状态</div>
          <div className="mt-1 text-sm font-semibold text-slate-100">
            {enabled ? status?.waitingReason || "等待状态" : "开关关闭"}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
        <div className="rounded-xl bg-emerald-500/10 px-2 py-2 text-emerald-300">
          <div className="text-[11px] text-emerald-200/70">激活中</div>
          <div className="mt-1 text-base font-semibold">{status?.activeCount ?? 0}</div>
        </div>
        <div className="rounded-xl bg-blue-500/10 px-2 py-2 text-blue-300">
          <div className="text-[11px] text-blue-200/70">可开启</div>
          <div className="mt-1 text-base font-semibold">{status?.availableCount ?? 0}</div>
        </div>
        <div className="rounded-xl bg-amber-500/10 px-2 py-2 text-amber-300">
          <div className="text-[11px] text-amber-200/70">冷却中</div>
          <div className="mt-1 text-base font-semibold">{status?.cooldownCount ?? 0}</div>
        </div>
        <div className="rounded-xl bg-slate-800 px-2 py-2 text-slate-300">
          <div className="text-[11px] text-slate-500">未知</div>
          <div className="mt-1 text-base font-semibold">{status?.unknownCount ?? 0}</div>
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-slate-900/70 px-3 py-2 text-xs">
        <div className="text-slate-500">当前覆盖 / 指派</div>
        {enabled && activeShips.length > 0 ? (
          <div className="mt-1 text-slate-200">
            <span className="font-semibold text-emerald-300">激活中：</span>
            {renderShipNames(activeShips)}
          </div>
        ) : enabled && currentCommand ? (
          <div className="mt-1 text-slate-200">
            <span className="font-semibold text-blue-200">已指派：</span>
            {currentCommand.shipName || currentCommand.shipTypeLabel}
            <span className="text-slate-500"> · 等待到 {formatTime(currentCommand.commandExpiresAt || nextActionAt)}</span>
            {currentCommand.activated !== null ? (
              <span className={currentCommand.activated ? "text-emerald-300" : "text-amber-300"}>
                {" "}
                · {currentCommand.activated ? "已回执" : "回执未开启"}
              </span>
            ) : null}
          </div>
        ) : (
          <div className="mt-1 text-slate-400">{enabled ? status?.waitingReason || "等待可用舰船" : "未开启轮转"}</div>
        )}
      </div>

      {enabled && !status?.coverageSufficient && eligibleShips.length > 0 ? (
        <div className="mt-3 rounded-xl border border-amber-500/25 bg-amber-950/20 px-3 py-2 text-xs text-amber-200">
          当前少于 {requiredCount} 艘，无法无缝覆盖；无人可用时会等待冷却结束后继续。
        </div>
      ) : null}

      {enabled ? (
        <div className="mt-3 space-y-1.5 text-xs text-slate-400">
          <div>激活中：{renderShipNames(activeShips)}</div>
          <div>可开启：{renderShipNames(availableShips)}</div>
          <div>冷却中：{renderShipNames(cooldownShips)}</div>
          {unknownShips.length > 0 ? <div>状态未知：{renderShipNames(unknownShips)}</div> : null}
        </div>
      ) : null}

      {eligibleShips.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {eligibleShips.slice(0, 6).map((ship) => (
            <span key={ship.clientId} className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
              {ship.shipName || ship.shipTypeLabel} · {formatAge(ship.ageMs)}
            </span>
          ))}
          {eligibleShips.length > 6 ? (
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-500">
              +{eligibleShips.length - 6}
            </span>
          ) : null}
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-slate-700 px-3 py-3 text-center text-xs text-slate-500">
          暂无在线使徒或特勒马科斯。
        </div>
      )}
    </section>
  );
}

export default RemoteDamageControlPanel;
