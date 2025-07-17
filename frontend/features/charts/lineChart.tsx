"use client";
import React, { useState } from "react";
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
import { useQuery } from "@tanstack/react-query";

type LineKey = string;

interface RawRow {
  date: string;
  [key: string]: any;
}
interface FormattedRow extends RawRow {
  formattedDate: string;
}

interface Props {
  fetchURL: string;
  lines: LineKey[];
  lineColors?: Record<LineKey, string>;
  lineLabels: Record<LineKey, string>;
  height?: number;
  parser?: (rows: RawRow[]) => FormattedRow[];
}

const formatDate = (d: string) =>
  `${String(new Date(d).getDate()).padStart(2, "0")} ${new Date(
    d
  ).toLocaleString("default", {
    month: "short",
  })}`;

const CustomTooltip: React.FC<{
  hoveredKey: string | null;
  active?: boolean;
  payload?: any[];
  label?: string;
}> = ({ active, payload, label, hoveredKey }) => {
  if (!active || !payload?.length) return null;

  const items = hoveredKey
    ? payload.filter((p) => p.dataKey === hoveredKey)
    : payload;

  return (
    <div className="rounded-md bg-white p-3 shadow-sm text-sm border border-gray-200">
      <p className="font-semibold mb-1 text-gray-800">{label}</p>
      {items.map((item) => (
        <p key={item.dataKey} style={{ color: item.color }}>
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
};

export default function ReusableLineChart({
  lineLabels,
  fetchURL,
  lines,
  lineColors = {},
  height = 300,
  parser,
}: Props) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const {
    data = [],
    isLoading,
    isError,
  } = useQuery<FormattedRow[]>({
    queryKey: ["lineChart", fetchURL],
    queryFn: async () => {
      const res = await fetch(fetchURL, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);

      const raw: RawRow[] = await res.json();

      return parser
        ? parser(raw)
        : raw.map((d) => ({
            ...d,
            formattedDate: formatDate(d.date),
          }));
    },
  });

  if (isLoading) return <p className="text-gray-500">Loading chart…</p>;
  if (isError) return <p className="text-red-500">Failed to load chart.</p>;
  if (!data.length)
    return (
      <div className="m-40">
        <p className="text-gray-500">No Device Click on Link Yet.</p>
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="formattedDate" />
        <YAxis domain={[0, "auto"]} allowDecimals={false} />
        <Tooltip
          content={(props) => (
            <CustomTooltip {...props} hoveredKey={hoveredKey} />
          )}
        />
        <Legend />
        {lines.map((key) => {
          const color = lineColors[key] ?? "#000";
          return (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={lineLabels?.[key] ?? capitalizeWords(key)}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 4, fill: "#fff", stroke: color, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}

function capitalizeWords(str: string): string {
  return str
    .split(/_|-/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}
