import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";

interface ApiRow {
  month: string; // "Jan", "Feb", …
  clicks: number;
}

const MONTH_ORDER = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function BarChart() {
  const [table, setTable] = useState<(string | number)[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxClicks, setMaxClicks] = useState(0);

  useEffect(() => {
    let cancel = false;

    async function load() {
      try {
        const res = await fetch(
          "http://localhost:8080/api/protected/analytics/bar",
          { credentials: "include" }
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);
        let rows: ApiRow[] = await res.json();

        // Sort by calendar order
        rows.sort(
          (a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month)
        );

        const max = Math.max(...rows.map((r) => r.clicks));

        if (!cancel) {
          const t: (string | number)[][] = [
            ["Month", "Clicks"],
            ...rows.map((r) => [r.month, r.clicks]),
          ];
          setTable(t);
          setMaxClicks(max);
        }
      } catch (e: any) {
        if (!cancel) setError(e.message);
      } finally {
        if (!cancel) setLoading(false);
      }
    }

    load();
    return () => {
      cancel = true;
    };
  }, []);

  const options = {
    colors: ["#2a9d90"],
    chartArea: { width: "70%", height: "70%" },
    height: 400,
    width: 600,

    hAxis: {
      title: "Total Clicks",

      format: "#,###",
      viewWindow: { min: 0 },
      ticks: (() => {
        const ticks = [];
        const step = Math.max(1, Math.floor(maxClicks / 5));
        for (let i = 0; i <= maxClicks; i += step) {
          ticks.push(i);
        }
        if (ticks[ticks.length - 1] !== maxClicks) ticks.push(maxClicks);
        console.log("Ticks:", ticks);
        return ticks;
      })(),
    },
    vAxis: {
      title: "Month",
      gridlines: { count: 5 },
    },
  };

  if (loading) return <p>Loading bar chart…</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (table.length <= 1) return <p>No click data for the last 12 months.</p>;
  return <Chart chartType="Bar" data={table} options={options} />;
}
