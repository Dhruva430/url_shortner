"use client";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxClicks, setMaxClicks] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/protected/analytics/worldmap?days=30", {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json: CountryStat[] = await res.json();

        if (!Array.isArray(json) || json.length === 0) {
          setData([["Country", "Clicks"]]);
          return;
        }

        const table = [
          ["Country", "Clicks"],
          ...json.map((entry) => [entry.country, entry.clicks]),
        ];
        const max = Math.max(...json.map((r) => r.clicks), 0);

        setData(table);
        setMaxClicks(max);
      } catch (e: any) {
        setError(e.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    }

    load();
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
  if (data.length <= 1) return <p>No country click data available.</p>;

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

            const rowIndex = selection[0].row + 1;
            const [country, clicks] = data[rowIndex];
            console.log(`Selected: ${country}, Clicks: ${clicks}`);
          },
        },
      ]}
    />
  );
}
