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
  device_type: "desktop" | "mobile" | "tablet" | "unknown";
  count: number;
};

type DeviceType = "desktop" | "mobile" | "tablet" | "unknown";

type DataItem = {
  name: string;
  value: number;
  trend: "up" | "down" | "same";
};

const COLORS: Record<DeviceType, string> = {
  desktop: "#2a9d90",
  mobile: "#e76e50",
  tablet: "#274754",
  unknown: "#888888",
};

const DevicePieChart: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(
          "http://localhost:8080/api/protected/analytics/devices",
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);

        const rows: ApiRow[] = await res.json();
        if (cancelled) return;

        const deviceTypes: DeviceType[] = [
          "desktop",
          "mobile",
          "tablet",
          "unknown",
        ];
        const deviceMap = new Map<string, number>();

        for (const r of rows) {
          deviceMap.set(r.device_type, r.count);
        }

        const mapped: DataItem[] = deviceTypes.map((type) => ({
          name: capitalize(type),
          value: deviceMap.get(type) || 0,
          trend: "same",
        }));

        setData(mapped);
        setLoading(false);
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (data.length === 0) return <p>No visits yet.</p>;

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
          label
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.name.toLowerCase() as DeviceType]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DevicePieChart;

// Helper
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
