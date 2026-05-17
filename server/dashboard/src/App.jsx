import * as echarts from "echarts";
import { useEffect, useMemo, useRef, useState } from "react";

const REFRESH_MS = 2000;

function formatTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString("zh-CN", { hour12: false });
}

function formatAge(ageMs) {
  if (ageMs === null || ageMs === undefined) return "-";
  if (ageMs < 1000) return "刚刚";
  if (ageMs < 60000) return `${Math.round(ageMs / 1000)} 秒前`;
  return `${Math.round(ageMs / 60000)} 分钟前`;
}

function formatMs(value) {
  if (value === null || value === undefined) return "-";
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return "-";
  if (numberValue >= 1000) return `${(numberValue / 1000).toFixed(1)}s`;
  return `${Math.round(numberValue)}ms`;
}

function formatLogTime(log) {
  return log.time || formatTime(log.timestamp || log.receivedAt);
}

function healthColor(value) {
  if (value === null || value === undefined) return "bg-slate-600";
  if (value <= 30) return "bg-red-500";
  if (value <= 60) return "bg-amber-400";
  return "bg-emerald-400";
}

function logLevelClass(level) {
  return {
    ERROR: "border-red-500/40 bg-red-500/10 text-red-200",
    WARN: "border-amber-500/40 bg-amber-500/10 text-amber-200",
    SUCCESS: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    INFO: "border-slate-600/70 bg-slate-800/60 text-slate-200"
  }[level] || "border-slate-600/70 bg-slate-800/60 text-slate-200";
}

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

function PercentBar({ label, value }) {
  const safeValue = value === null || value === undefined ? 0 : value;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span>{value === null || value === undefined ? "-" : `${value}%`}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all ${healthColor(value)}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, tone = "slate" }) {
  const toneClass = {
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    red: "text-red-300",
    blue: "text-blue-300",
    slate: "text-slate-100"
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-black/20">
      <div className="text-sm text-slate-400">{label}</div>
      <div className={`mt-2 text-3xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

function ShipCard({ ship, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(ship.clientId)}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        active
          ? "border-blue-400 bg-blue-950/40 shadow-lg shadow-blue-950/40"
          : "border-slate-800 bg-slate-950/70 hover:border-slate-600"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-slate-100">{ship.shipName || ship.shipTypeLabel}</div>
          <div className="mt-1 text-xs text-slate-500">{ship.clientId}</div>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            ship.online ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-700/60 text-slate-300"
          }`}
        >
          {ship.online ? "在线" : "离线"}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <PercentBar label="护盾" value={ship.shieldPercent} />
        <PercentBar label="装甲" value={ship.armorPercent} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
        <span className="rounded-full bg-slate-800 px-2 py-1">{ship.shipTypeLabel}</span>
        <span className="rounded-full bg-slate-800 px-2 py-1">最后上报 {formatAge(ship.ageMs)}</span>
        {ship.damageControlActivated ? (
          <span className="rounded-full bg-amber-500/15 px-2 py-1 text-amber-300">已开损控</span>
        ) : null}
      </div>
    </button>
  );
}

function HealthChart({ ship, history }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return undefined;
    chartInstanceRef.current = echarts.init(chartRef.current, "dark");

    const handleResize = () => {
      chartInstanceRef.current?.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstanceRef.current?.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartInstanceRef.current) return;

    const points = history.length
      ? history
      : ship
        ? [
            {
              observedAt: ship.observedAt || ship.lastSeenAt,
              shieldPercent: ship.shieldPercent,
              armorPercent: ship.armorPercent
            }
          ]
        : [];

    chartInstanceRef.current.setOption({
      backgroundColor: "transparent",
      tooltip: { trigger: "axis" },
      legend: {
        top: 0,
        textStyle: { color: "#CBD5E1" },
        data: ["护盾", "装甲"]
      },
      grid: { left: 38, right: 20, top: 48, bottom: 36 },
      xAxis: {
        type: "category",
        boundaryGap: false,
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: { color: "#94A3B8" },
        data: points.map((point) => formatTime(point.observedAt || point.receivedAt))
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 100,
        axisLabel: { color: "#94A3B8", formatter: "{value}%" },
        splitLine: { lineStyle: { color: "#1E293B" } }
      },
      series: [
        {
          name: "护盾",
          type: "line",
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 3, color: "#38BDF8" },
          areaStyle: { color: "rgba(56, 189, 248, 0.12)" },
          data: points.map((point) => point.shieldPercent)
        },
        {
          name: "装甲",
          type: "line",
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 3, color: "#F59E0B" },
          areaStyle: { color: "rgba(245, 158, 11, 0.12)" },
          data: points.map((point) => point.armorPercent)
        }
      ]
    });
  }, [ship, history]);

  return <div ref={chartRef} className="h-[320px] w-full" />;
}

function ClientLogPanel({ ship, logs, error }) {
  return (
    <div className="mt-5 border-t border-slate-800 pt-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">运行日志</h3>
          <p className="text-xs text-slate-500">
            {ship ? `最近 ${logs.length} 条 · ${ship.clientId}` : "等待选择客户端"}
          </p>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
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
        <div className="mt-3 max-h-[360px] space-y-2 overflow-y-auto pr-1">
          {logs.map((log, index) => (
            <div key={log.id || `${log.receivedAt}-${index}`} className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`rounded-full border px-2 py-0.5 font-medium ${logLevelClass(log.level)}`}>
                  {log.level || "INFO"}
                </span>
                <span className="font-mono text-slate-500">{formatLogTime(log)}</span>
              </div>
              <div className="mt-2 whitespace-pre-wrap break-words font-mono text-xs leading-5 text-slate-200">
                {log.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
  const slowEvents = (perf?.slowEvents || []).slice(0, 8);

  return (
    <div className="mt-5 border-t border-slate-800 pt-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">性能统计</h3>
          <p className="text-xs text-slate-500">
            {ship ? `最近汇总 · ${ship.clientId}` : "等待选择客户端"}
          </p>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
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
        <div className="mt-3 space-y-4">
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
                <div className="mt-3 space-y-2">
                  {analysis.findings.slice(0, 4).map((finding, index) => (
                    <div key={`${finding.title}-${index}`} className={`rounded-xl border px-3 py-2 ${findingClass(finding.severity)}`}>
                      <div className="text-xs font-semibold text-slate-100">{finding.title}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-300">{finding.description}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-400">建议：{finding.recommendation}</div>
                    </div>
                  ))}
                </div>
              ) : null}

              {(analysis.bottlenecks || []).length > 0 ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {analysis.bottlenecks.slice(0, 4).map((metric) => (
                    <div key={metric.name} className="flex items-center justify-between rounded-lg bg-slate-950/30 px-3 py-2 text-xs">
                      <span>{metric.label || perfMetricLabel(metric.name)}</span>
                      <span className="font-mono">avg {formatMs(metric.avgMs)} · max {formatMs(metric.maxMs)}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {keyMetrics.map((metric) => (
              <div key={metric.name} className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3">
                <div className="text-xs text-slate-500">{perfMetricLabel(metric.name)}</div>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div className="text-2xl font-semibold text-blue-200">{formatMs(metric.avgMs)}</div>
                  <div className="text-right text-xs text-slate-500">
                    <div>max {formatMs(metric.maxMs)}</div>
                    <div>{metric.count} 次 · 慢 {metric.slowCount || 0}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {metrics.length > keyMetrics.length ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {metrics
                .filter((metric) => !keyMetrics.some((item) => item.name === metric.name))
                .map((metric) => (
                  <div key={metric.name} className="flex items-center justify-between rounded-lg bg-slate-900/50 px-3 py-2 text-xs">
                    <span className="text-slate-400">{perfMetricLabel(metric.name)}</span>
                    <span className="font-mono text-slate-200">
                      avg {formatMs(metric.avgMs)} · max {formatMs(metric.maxMs)}
                    </span>
                  </div>
                ))}
            </div>
          ) : null}

          <div>
            <div className="mb-2 text-xs font-medium text-slate-400">最近慢操作</div>
            {slowEvents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 px-4 py-4 text-center text-xs text-slate-500">
                当前没有慢操作记录。
              </div>
            ) : (
              <div className="space-y-2">
                {slowEvents.map((event, index) => (
                  <div key={`${event.occurredAt}-${event.name}-${index}`} className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-amber-200">{perfMetricLabel(event.name)}</span>
                      <span className="font-mono text-amber-100">{formatMs(event.elapsedMs)}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-400">
                      <span>{formatTime(event.occurredAt)}</span>
                      {event.detail ? <span className="font-mono">{event.detail}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [ships, setShips] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [history, setHistory] = useState([]);
  const [clientLogs, setClientLogs] = useState([]);
  const [logsError, setLogsError] = useState("");
  const [perfData, setPerfData] = useState(null);
  const [perfError, setPerfError] = useState("");
  const [lastRefreshAt, setLastRefreshAt] = useState(null);
  const [error, setError] = useState("");

  const selectedShip = useMemo(() => {
    if (selectedClientId) {
      return ships.find((ship) => ship.clientId === selectedClientId) || null;
    }
    return ships[0] || null;
  }, [selectedClientId, ships]);

  const groupedShips = useMemo(() => {
    return ships.reduce((groups, ship) => {
      const key = ship.shipTypeLabel || "未知舰船";
      if (!groups[key]) groups[key] = [];
      groups[key].push(ship);
      return groups;
    }, {});
  }, [ships]);

  useEffect(() => {
    let cancelled = false;

    async function loadFleet() {
      try {
        const [shipsResponse, summaryResponse] = await Promise.all([
          fetch("/api/fleet/ships"),
          fetch("/api/fleet/summary")
        ]);
        const shipsJson = await shipsResponse.json();
        const summaryJson = await summaryResponse.json();

        if (!shipsJson.success || !summaryJson.success) {
          throw new Error(shipsJson.error || summaryJson.error || "接口返回失败");
        }

        if (!cancelled) {
          setShips(shipsJson.ships || []);
          setSummary(summaryJson.summary || null);
          setLastRefreshAt(Date.now());
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || "舰队数据加载失败");
        }
      }
    }

    loadFleet();
    const timer = window.setInterval(loadFleet, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!selectedShip && selectedClientId) {
      setSelectedClientId("");
      return;
    }
    if (!selectedClientId && selectedShip) {
      setSelectedClientId(selectedShip.clientId);
    }
  }, [selectedClientId, selectedShip]);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      if (!selectedShip) {
        setHistory([]);
        return;
      }

      try {
        const response = await fetch(`/api/fleet/ships/${encodeURIComponent(selectedShip.clientId)}/history`);
        const json = await response.json();
        if (!json.success) {
          throw new Error(json.error || "历史数据加载失败");
        }
        if (!cancelled) {
          setHistory(json.history || []);
        }
      } catch (historyError) {
        if (!cancelled) {
          setHistory([]);
        }
      }
    }

    loadHistory();
    const timer = window.setInterval(loadHistory, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [selectedShip]);

  useEffect(() => {
    let cancelled = false;

    async function loadLogs() {
      if (!selectedShip) {
        setClientLogs([]);
        setLogsError("");
        return;
      }

      try {
        const response = await fetch(`/api/fleet/ships/${encodeURIComponent(selectedShip.clientId)}/logs?limit=100`);
        const json = await response.json();
        if (!json.success) {
          throw new Error(json.error || "日志加载失败");
        }
        if (!cancelled) {
          setClientLogs(json.logs || []);
          setLogsError("");
        }
      } catch (logsLoadError) {
        if (!cancelled) {
          setClientLogs([]);
          setLogsError(logsLoadError.message || "日志加载失败");
        }
      }
    }

    loadLogs();
    const timer = window.setInterval(loadLogs, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [selectedShip]);

  useEffect(() => {
    let cancelled = false;

    async function loadPerf() {
      if (!selectedShip) {
        setPerfData(null);
        setPerfError("");
        return;
      }

      try {
        const response = await fetch(`/api/fleet/ships/${encodeURIComponent(selectedShip.clientId)}/perf`);
        const json = await response.json();
        if (!json.success) {
          throw new Error(json.error || "性能统计加载失败");
        }
        if (!cancelled) {
          setPerfData(json.perf || null);
          setPerfError("");
        }
      } catch (perfLoadError) {
        if (!cancelled) {
          setPerfData(null);
          setPerfError(perfLoadError.message || "性能统计加载失败");
        }
      }
    }

    loadPerf();
    const timer = window.setInterval(loadPerf, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [selectedShip]);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm font-medium text-blue-300">QuantumFAX Fleet Monitor</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">舰队血量看板</h1>
            <p className="mt-2 text-sm text-slate-400">
              汇总 EasyClick 客户端上报的护盾、装甲和损控状态，页面每 {REFRESH_MS / 1000} 秒自动刷新。
            </p>
          </div>
          <div className="rounded-full border border-slate-800 bg-slate-950/70 px-4 py-2 text-sm text-slate-400">
            最近刷新：{formatTime(lastRefreshAt)}
          </div>
        </header>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="在线舰船" value={summary?.online ?? 0} tone="emerald" />
          <StatCard label="离线舰船" value={summary?.offline ?? 0} tone="slate" />
          <StatCard label="低盾数量" value={summary?.lowShield ?? 0} tone="amber" />
          <StatCard label="低甲数量" value={summary?.lowArmor ?? 0} tone="red" />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">血量曲线</h2>
                <p className="text-sm text-slate-400">
                  {selectedShip ? `${selectedShip.shipName || selectedShip.shipTypeLabel} · ${selectedShip.clientId}` : "等待舰船上报"}
                </p>
              </div>
              {selectedShip ? (
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                  {selectedShip.online ? "在线" : "离线"} · {formatAge(selectedShip.ageMs)}
                </span>
              ) : null}
            </div>

            {selectedShip ? (
              <HealthChart ship={selectedShip} history={history} />
            ) : (
              <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
                暂无舰船数据，请先启动客户端并上报血量。
              </div>
            )}

            <PerfMetricPanel ship={selectedShip} perf={perfData} error={perfError} />
            <ClientLogPanel ship={selectedShip} logs={clientLogs} error={logsError} />
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
              <h2 className="text-lg font-semibold text-white">舰船分组</h2>
              <div className="mt-4 space-y-2">
                {(summary?.byShipType || []).map((item) => (
                  <div key={item.shipType} className="flex items-center justify-between rounded-xl bg-slate-900/70 px-3 py-2 text-sm">
                    <span className="text-slate-300">{item.shipTypeLabel}</span>
                    <span className="text-slate-500">
                      在线 {item.online} / 总计 {item.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-6 space-y-6">
          {Object.keys(groupedShips).length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center text-slate-500">
              还没有收到舰船上报。请在客户端配置舰船类型和后端地址后启动主循环。
            </div>
          ) : (
            Object.keys(groupedShips).map((groupName) => (
              <div key={groupName}>
                <h2 className="mb-3 text-lg font-semibold text-white">{groupName}</h2>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {groupedShips[groupName].map((ship) => (
                    <ShipCard
                      key={ship.clientId}
                      ship={ship}
                      active={selectedShip?.clientId === ship.clientId}
                      onSelect={setSelectedClientId}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
