import React from "react";
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

const data = [
  { date: "Jan 1", clicks: 0, links: 20 },
  { date: "Jan 2", clicks: 10, links: 18 },
  { date: "Jan 3", clicks: 48, links: 21 },
  { date: "Jan 4", clicks: 60, links: 24 },
  { date: "Jan 5", clicks: 100, links: 26 },
  { date: "Jan 6", clicks: 68, links: 28 },
  { date: "Jan 7", clicks: 75, links: 30 },
];

const MyLineChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="clicks"
          name="Clicks"
          stroke="#00b3b3"
          strokeWidth={2}
          dot={{ r: 4, fill: "#fff", stroke: "#00b3b3", strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="links"
          name="New Links"
          stroke="#f25c54"
          strokeWidth={2}
          dot={{ r: 4, fill: "#fff", stroke: "#f25c54", strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MyLineChart;
