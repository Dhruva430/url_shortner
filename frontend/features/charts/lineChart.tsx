import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RawDataPoint {
  date: string;
  clicks: number;
  links: number;
}
interface DataPoint extends RawDataPoint {
  formattedDate: string;
}

const formatDate = (d: string) =>
  `${new Date(d).getDate()} ${new Date(d).toLocaleString("default", {
    month: "short",
  })}`;

/* ------------ 1. Custom tooltip ------------ */
const CustomTooltip: React.FC<
  {
    hoveredKey: string | null;
  } & { active?: boolean; payload?: any[]; label?: string }
> = ({ active, payload, label, hoveredKey }) => {
  if (!active || !payload?.length) return null;

  // keep only the series that is currently hovered
  const items = hoveredKey
    ? payload.filter((p) => p.dataKey === hoveredKey)
    : payload;

  return (
    <div className="rounded-md bg-white p-2 shadow-sm">
      <p className="font-semibold mb-1">{label}</p>
      {items.map((item) => (
        <p key={item.dataKey} style={{ color: item.color }}>
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
};

/* ------------ 2. Main chart component ------------ */
const MyLineChart: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null); // track which line is under the mouse

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          "http://localhost:8080/api/protected/analytics/line?days=7",
          { credentials: "include" }
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const raw: RawDataPoint[] = await res.json();
        if (!cancelled) {
          setData(
            raw.map((d) => ({ ...d, formattedDate: formatDate(d.date) }))
          );
        }
      } catch (e) {
        console.error("Failed to fetch chart data", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full">
      {loading ? (
        <p>Loading chart…</p>
      ) : data.length === 0 ? (
        <p>No data found.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="formattedDate" />
            <YAxis domain={[0, "auto"]} allowDecimals={false} />
            {/* 3. Plug in custom tooltip */}
            <Tooltip
              content={(props) => (
                <CustomTooltip {...props} hoveredKey={hoveredKey} />
              )}
            />
            <Legend />
            {/* 4. Track mouse enter/leave for each line */}
            <Line
              type="monotone"
              dataKey="clicks"
              name="Clicks"
              stroke="#00b3b3"
              strokeWidth={2}
              dot={{ r: 4, fill: "#fff", stroke: "#00b3b3", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              onMouseEnter={() => setHoveredKey("clicks")}
              onMouseLeave={() => setHoveredKey(null)}
            />
            <Line
              type="monotone"
              dataKey="links"
              name="New Links Clicks"
              stroke="#f25c54"
              strokeWidth={2}
              dot={{ r: 4, fill: "#fff", stroke: "#f25c54", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              onMouseEnter={() => setHoveredKey("links")}
              onMouseLeave={() => setHoveredKey(null)}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default MyLineChart;
