import { formatMs, formatTime } from "../utils/format";

const PERF_METRIC_LABELS = {
  tick: "主循环 tick",
  "health.emergency": "损控检测",
  "health.capture": "截图",
  "health.pixel": "像素检测",
  "health.damageTemplate": "损控模板匹配",
  "health.spaceTemplate": "在太空模板匹配",
  "fleet.schedule": "舰队上报调度",
  "fleet.http": "舰队上报 HTTP",
  "logs.schedule": "日志上报调度",
  "logs.http": "日志上报 HTTP"
};

function perfMetricLabel(name) {
  return PERF_METRIC_LABELS[name] || name;
}

function analysisStatusLabel(status) {
  return {
    critical: "严重",
    warn: "风险",
    good: "正常",
    insufficient: "等待数据"
  }[status] || "未知";
}

function analysisStatusClass(status) {
  return {
    critical: "border-red-500/40 bg-red-500/10 text-red-200",
    warn: "border-amber-500/40 bg-amber-500/10 text-amber-200",
    good: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    insufficient: "border-slate-700 bg-slate-800/60 text-slate-300"
  }[status] || "border-slate-700 bg-slate-800/60 text-slate-300";
}

function findingClass(severity) {
  return {
    critical: "border-red-500/30 bg-red-500/10",
    warn: "border-amber-500/30 bg-amber-500/10",
    info: "border-blue-500/30 bg-blue-500/10"
  }[severity] || "border-slate-700 bg-slate-900/60";
}

function PerfMetricPanel({ ship, perf, error }) {
  const latest = perf?.latest || null;
  const analysis = perf?.analysis || null;
  const metrics = latest?.metrics || [];
  const metricByName = metrics.reduce((map, metric) => {
    map[metric.name] = metric;
    return map;
  }, {});
  const keyMetrics = [
    "tick",
    "health.emergency",
    "health.capture",
    "health.damageTemplate",
    "fleet.http",
    "logs.http"
  ].map((name) => metricByName[name]).filter(Boolean);
  const slowEvents = (perf?.slowEvents || []).slice(0, 6);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/75 p-4 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">性能统计</h2>
          <p className="text-xs text-slate-500">
            {ship ? `最近汇总 · ${ship.clientId}` : "等待选择客户端"}
          </p>
        </div>
        <span className="w-fit rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
          {latest ? `采集于 ${formatTime(latest.collectedAt || latest.receivedAt)}` : "暂无数据"}
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
      ) : !latest && !error ? (
        <div className="mt-3 rounded-xl border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-500">
          暂无性能统计。客户端运行约一分钟后会自动上报汇总。
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {analysis ? (
            <div className={`rounded-2xl border px-4 py-3 ${analysisStatusClass(analysis.status)}`}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-xs font-medium opacity-80">后端分析</div>
                  <div className="mt-1 text-sm font-semibold">{analysis.headline}</div>
                  <div className="mt-1 text-xs opacity-75">
                    基于最近 {analysis.windowSize || 0} 次性能汇总 · {formatTime(analysis.generatedAt)}
                  </div>
                </div>
                <span className="w-fit rounded-full border border-current/30 px-2.5 py-1 text-xs font-medium">
                  {analysisStatusLabel(analysis.status)}
                </span>
              </div>

              {(analysis.findings || []).length > 0 ? (
                <div className="mt-3 grid gap-2 2xl:grid-cols-2">
                  {analysis.findings.slice(0, 4).map((finding, index) => (
                    <div key={`${finding.title}-${index}`} className={`rounded-xl border px-3 py-2 ${findingClass(finding.severity)}`}>
                      <div className="text-xs font-semibold text-slate-100">{finding.title}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-300">{finding.description}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-400">建议：{finding.recommendation}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-3">
            {keyMetrics.map((metric) => (
              <div key={metric.name} className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
                <div className="truncate text-[11px] text-slate-500">{perfMetricLabel(metric.name)}</div>
                <div className="mt-1 flex items-end justify-between gap-3">
                  <div className="text-xl font-semibold text-blue-200">{formatMs(metric.avgMs)}</div>
                  <div className="text-right text-[11px] text-slate-500">
                    <div>max {formatMs(metric.maxMs)}</div>
                    <div>{metric.count} 次 · 慢 {metric.slowCount || 0}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            {metrics.length > keyMetrics.length ? (
              <div>
                <div className="mb-2 text-xs font-medium text-slate-400">其他指标</div>
                <div className="max-h-[170px] space-y-1 overflow-y-auto pr-1">
                  {metrics
                    .filter((metric) => !keyMetrics.some((item) => item.name === metric.name))
                    .map((metric) => (
                      <div key={metric.name} className="flex items-center justify-between gap-3 rounded-lg bg-slate-900/50 px-3 py-1.5 text-xs">
                        <span className="truncate text-slate-400">{perfMetricLabel(metric.name)}</span>
                        <span className="shrink-0 font-mono text-slate-200">
                          avg {formatMs(metric.avgMs)} · max {formatMs(metric.maxMs)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ) : null}

            <div>
              <div className="mb-2 text-xs font-medium text-slate-400">最近慢操作</div>
              {slowEvents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-700 px-4 py-4 text-center text-xs text-slate-500">
                  当前没有慢操作记录。
                </div>
              ) : (
                <div className="max-h-[170px] space-y-1 overflow-y-auto pr-1">
                  {slowEvents.map((event, index) => (
                    <div key={`${event.occurredAt}-${event.name}-${index}`} className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-medium text-amber-200">{perfMetricLabel(event.name)}</span>
                        <span className="font-mono text-amber-100">{formatMs(event.elapsedMs)}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-400">
                        <span>{formatTime(event.occurredAt)}</span>
                        {event.detail ? <span className="font-mono">{event.detail}</span> : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default PerfMetricPanel;
