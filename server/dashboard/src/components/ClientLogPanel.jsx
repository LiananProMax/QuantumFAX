import { REFRESH_MS } from "../constants";
import { formatLogTime } from "../utils/format";

function logLevelClass(level) {
  return {
    ERROR: "border-red-500/40 bg-red-500/10 text-red-200",
    WARN: "border-amber-500/40 bg-amber-500/10 text-amber-200",
    SUCCESS: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    INFO: "border-slate-600/70 bg-slate-800/60 text-slate-200"
  }[level] || "border-slate-600/70 bg-slate-800/60 text-slate-200";
}

function ClientLogPanel({ ship, logs, error }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/75 p-4 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">运行日志</h2>
          <p className="text-xs text-slate-500">
            {ship ? `最近 ${logs.length} 条 · ${ship.clientId}` : "等待选择客户端"}
          </p>
        </div>
        <span className="w-fit rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
          每 {REFRESH_MS / 1000} 秒刷新
        </span>
      </div>

      {error ? (
        <div className="mt-3 rounded-xl border border-red-500/30 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {!ship ? (
        <div className="mt-3 rounded-xl border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-500">
          暂无客户端，请先启动并上报舰船状态。
        </div>
      ) : logs.length === 0 && !error ? (
        <div className="mt-3 rounded-xl border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-500">
          暂无日志。客户端启动主循环后会批量上报本地面板日志。
        </div>
      ) : (
        <div className="mt-3 max-h-[340px] overflow-y-auto pr-1">
          <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-900/40">
            {logs.map((log, index) => (
              <div key={log.id || `${log.receivedAt}-${index}`} className="grid gap-2 px-3 py-2 text-xs lg:grid-cols-[86px_76px_minmax(0,1fr)]">
                <span className={`w-fit rounded-full border px-2 py-0.5 font-medium ${logLevelClass(log.level)}`}>
                  {log.level || "INFO"}
                </span>
                <span className="font-mono text-slate-500">{formatLogTime(log)}</span>
                <span className="min-w-0 whitespace-pre-wrap break-words font-mono leading-5 text-slate-200">
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default ClientLogPanel;
