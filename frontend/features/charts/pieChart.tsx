"use client";
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type ApiRow = {
  device_type: string;
  count: number;
};

type DeviceType = "desktop" | "mobile" | "tablet" | "unknown";

type DataItem = {
  name: DeviceType; // enforce type
  value: number;
  trend: "up" | "down" | "same";
};

const COLORS: Record<DeviceType, string> = {
  desktop: "#2a9d90",
  mobile: "#e76e50",
  tablet: "#274754",
  unknown: "#888888",
};

const DEVICE_TYPES: DeviceType[] = ["desktop", "mobile", "tablet", "unknown"];

const DevicePieChart: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/protected/analytics/devices", {
          credentials: "include",
        });

        if (!res.ok) throw new Error(`Status ${res.status}`);

        const rows: ApiRow[] | null = await res.json();
        if (cancelled) return;

        if (!Array.isArray(rows)) {
          throw new Error("Invalid response format: expected an array");
        }

        const map = new Map<DeviceType, number>();
        for (const row of rows) {
          const key = row.device_type.toLowerCase() as DeviceType;
          if (DEVICE_TYPES.includes(key)) {
            map.set(key, row.count);
          }
        }

        const chartData: DataItem[] = DEVICE_TYPES.map((type) => ({
          name: type,
          value: map.get(type) || 0,
          trend: "same",
        }));

        setData(chartData);
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

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (data.every((d) => d.value === 0)) return <p>No device visit data yet.</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
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
};

export default DevicePieChart;

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
