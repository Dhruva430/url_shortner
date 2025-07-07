import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";

interface CountryStat {
  country: string;
  clicks: number;
}

export function WorldMap() {
  const [data, setData] = useState<(string | number)[][]>([
    ["Country", "Clicks"],
  ]);
  const [maxClicks, setMaxClicks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(
          "http://localhost:8080/api/protected/analytics/worldmap?days=30",
          { credentials: "include" }
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json: CountryStat[] = await res.json();
        console.log("worldmap JSON:", json);

        if (cancelled) return;

        const table: (string | number)[][] = [
          ["Country", "Clicks"],
          ...json.map((entry) => [entry.country, entry.clicks]),
        ];

        const max = Math.max(...json.map((r) => r.clicks), 0);

        setData(table);
        setMaxClicks(max);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const options = {
    colorAxis: {
      colors: ["#e0f3f8", "#005f73"],
      minValue: 0,
      maxValue: maxClicks || 1,
    },
    backgroundColor: "#f8f9fa",
    datalessRegionColor: "#d6d6d6",
    defaultColor: "#f5f5f5",
  };

  if (loading) return <p>Loading world map…</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (data.length <= 1) return <p>No click data available.</p>;

  return (
    <Chart
      chartType="GeoChart"
      width="100%"
      height="500px"
      data={data}
      options={options}
      chartEvents={[
        {
          eventName: "select",
          callback: ({ chartWrapper }) => {
            const chart = chartWrapper?.getChart();
            const selection = chart?.getSelection?.();
            if (!selection?.length) return;

            const [row] = selection;
            const [country, clicks] = data[row.row + 1];
            console.log(`Selected: ${country}, Clicks: ${clicks}`);
          },
        },
      ]}
    />
  );
}
