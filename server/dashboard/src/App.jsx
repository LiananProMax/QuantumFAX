import { useEffect, useMemo, useState } from "react";

import ClientLogPanel from "./components/ClientLogPanel";
import FleetGroupPanel from "./components/FleetGroupPanel";
import HealthChart from "./components/HealthChart";
import PerfMetricPanel from "./components/PerfMetricPanel";
import ShipRosterPanel from "./components/ShipRosterPanel";
import StatCard from "./components/StatCard";
import { REFRESH_MS } from "./constants";
import { formatAge, formatTime } from "./utils/format";

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
    <main className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        <header className="flex flex-col gap-4 border-b border-slate-800/70 pb-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="text-sm font-medium text-blue-300">QuantumFAX Fleet Monitor</div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">舰队血量看板</h1>
            <p className="mt-2 text-sm text-slate-400">
              汇总 EasyClick 客户端上报的护盾、装甲和损控状态，页面每 {REFRESH_MS / 1000} 秒自动刷新。
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-slate-400">
            <span className="rounded-full border border-slate-800 bg-slate-950/75 px-4 py-2">
              最近刷新：{formatTime(lastRefreshAt)}
            </span>
            <span className="rounded-full border border-slate-800 bg-slate-950/75 px-4 py-2">
              当前监控：{selectedShip ? selectedShip.shipName || selectedShip.shipTypeLabel : "等待上报"}
            </span>
          </div>
        </header>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
          <div className="min-w-0 space-y-5">
            <section className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              <StatCard label="在线舰船" value={summary?.online ?? 0} tone="emerald" />
              <StatCard label="离线舰船" value={summary?.offline ?? 0} tone="slate" />
              <StatCard label="低盾数量" value={summary?.lowShield ?? 0} tone="amber" />
              <StatCard label="低甲数量" value={summary?.lowArmor ?? 0} tone="red" />
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-950/75 p-4 shadow-xl shadow-black/20">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">血量曲线</h2>
                  <p className="text-sm text-slate-400">
                    {selectedShip ? `${selectedShip.shipName || selectedShip.shipTypeLabel} · ${selectedShip.clientId}` : "等待舰船上报"}
                  </p>
                </div>
                {selectedShip ? (
                  <span className="w-fit rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                    {selectedShip.online ? "在线" : "离线"} · {formatAge(selectedShip.ageMs)}
                  </span>
                ) : null}
              </div>

              {selectedShip ? (
                <HealthChart ship={selectedShip} history={history} />
              ) : (
                <div className="flex h-[300px] items-center justify-center text-sm text-slate-500 2xl:h-[340px]">
                  暂无舰船数据，请先启动客户端并上报血量。
                </div>
              )}
            </section>

            <section className="grid gap-5 2xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
              <PerfMetricPanel ship={selectedShip} perf={perfData} error={perfError} />
              <ClientLogPanel ship={selectedShip} logs={clientLogs} error={logsError} />
            </section>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-4 xl:self-start">
            <ShipRosterPanel
              ships={ships}
              selectedClientId={selectedShip?.clientId || ""}
              onSelect={setSelectedClientId}
            />
            <FleetGroupPanel groups={summary?.byShipType || []} />
          </aside>
        </section>
      </div>
    </main>
  );
}

export default App;
