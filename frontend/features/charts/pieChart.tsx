"use client";
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";

type DeviceType = "desktop" | "mobile" | "tablet" | "unknown";

type DataItem = {
  name: DeviceType;
  value: number;
  trend: "up" | "down" | "same";
};

type Props = {
  fetchURL: string;
  title?: string;
  height?: number;
};

const COLORS: Record<DeviceType, string> = {
  desktop: "#2a9d90",
  mobile: "#e76e50",
  tablet: "#274754",
  unknown: "#888888",
};

const DEVICE_TYPES: DeviceType[] = ["desktop", "mobile", "tablet", "unknown"];

export default function DevicePieChart({
  fetchURL,
  title,
  height = 300,
}: Props) {
  const {
    data = [],
    isLoading,
    isError,
  } = useQuery<DataItem[]>({
    queryKey: ["deviceStats", fetchURL],
    queryFn: async () => {
      const res = await fetch(fetchURL, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);

      const rows: { device_type: string; count: number }[] = await res.json();

      const map = new Map<DeviceType, number>();
      for (const row of rows) {
        const rawType = row.device_type?.toLowerCase() || "unknown";
        const type = DEVICE_TYPES.includes(rawType as DeviceType)
          ? (rawType as DeviceType)
          : "unknown";
        map.set(type, row.count);
      }
      console.log("Device stats map:", map);

      return DEVICE_TYPES.map((type) => ({
        name: type,
        value: map.get(type) || 0,
        trend: "same",
      }));
    },
  });

  if (isLoading) return <p>Loading…</p>;
  console.log("Device stats data:", data);
  if (isError)
    return <p style={{ color: "red" }}>Error loading device stats</p>;
  if (data.every((d) => d.value === 0)) return <p>No device visit data yet.</p>;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        {title && (
          <text x={150} y={20} textAnchor="middle" fontWeight="bold">
            {title}
          </text>
        )}
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={60}
          label={({ name, value }) => {
            if (value === 0) return null;
            return capitalize(name);
          }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend formatter={(value) => capitalize(value as string)} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
