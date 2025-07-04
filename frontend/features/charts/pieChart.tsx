import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Define the data type
type DataItem = {
  name: string;
  value: number;
  trend: "up" | "down" | "same";
};

// Hardcoded comparison logic
const data: DataItem[] = [
  { name: "Desktop", value: 1000, trend: "up" },
  { name: "Mobile", value: 200, trend: "down" },
  { name: "Tablet", value: 300, trend: "same" },
];

// Define colors for trends
const COLORS: Record<DataItem["trend"], string> = {
  up: "#2a9d90",
  down: "#e76e50",
  same: "#274754",
};

const HardcodedPieChart: React.FC = () => {
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
            <Cell key={`cell-${index}`} fill={COLORS[entry.trend]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default HardcodedPieChart;
