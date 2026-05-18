import * as echarts from "echarts";
import { useEffect, useRef } from "react";

import { formatTime } from "../utils/format";

function HealthChart({ ship, history }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return undefined;
    chartInstanceRef.current = echarts.init(chartRef.current, "dark");

    const handleResize = () => {
      chartInstanceRef.current?.resize();
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartRef.current);
    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
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
      grid: { left: 38, right: 18, top: 42, bottom: 30 },
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

  return <div ref={chartRef} className="h-[300px] w-full 2xl:h-[340px]" />;
}

export default HealthChart;
