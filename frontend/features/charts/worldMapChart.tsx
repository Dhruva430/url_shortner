"use client";
import React from "react";
import { Chart } from "react-google-charts";
import { useQuery } from "@tanstack/react-query";
import { divIcon, map } from "leaflet";

interface CountryStat {
  country: string;
  clicks: number;
}

type Props = {
  fetchURL: string; // Optional, fallback to context
  days?: number;
  title?: string;
  height?: string;
  parser?: (data: any[]) => [string, number][];
};

export const WorldMap: React.FC<Props> = ({
  fetchURL,
  days = 30,
  title,
  height = "500px",
  parser,
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["world-map", fetchURL],
    queryFn: async () => {
      const res = await fetch(fetchURL, { credentials: "include" });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();

      if (!Array.isArray(json)) throw new Error("Expected array");
      return parser
        ? [["Country", "Clicks"], ...parser(json)]
        : [
            ["Country", "Clicks"],
            ...json.map((r: CountryStat) => [r.country, r.clicks]),
          ];
    },
  });

  const maxClicks = data
    ? Math.max(...data.slice(1).map((d) => d[1] as number), 0)
    : 1;

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

  if (isLoading) return <p>Loading world map…</p>;
  if (error)
    return <p style={{ color: "red" }}>Error: {(error as Error).message}</p>;
  if (!data || data.length <= 1)
    return (
      <div className="m-50 text-gray-500">
        <p>No Device Clicked Yet.</p>
      </div>
    );

  return (
    <div className="w-full">
      {title && <h2 className="text-lg font-medium mb-2">{title}</h2>}
      <Chart
        chartType="GeoChart"
        width="100%"
        height={height}
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
    </div>
  );
};
