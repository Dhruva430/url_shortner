"use client";
import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import moment from "moment";
interface ApiRow {
  month: Date;
  click_count: number;
}

const MONTH_ORDER = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const BarChart: React.FC = () => {
  const [data, setData] = useState<(string | number)[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxClicks, setMaxClicks] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/protected/analytics/bar", {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        let rows: ApiRow[] = await res.json();

        if (!Array.isArray(rows) || rows.length === 0) {
          setData([]);
          return;
        }

        let monthRows = rows.map((r) => ({
          month: moment(r.month).format("MMM"),
          clicks: r.click_count || 0,
        }));
        let data: Record<string, number> = {};

        const currentMonthNum = moment().month();
        console.log("Current month number:", currentMonthNum);
        let monthsToShow = [
          ...MONTH_ORDER.slice(currentMonthNum + 1),
          ...MONTH_ORDER.slice(0, currentMonthNum + 1),
        ];

        MONTH_ORDER.forEach((month) => {
          data[month] = 0;
        });
        const max = Math.max(...rows.map((r) => r.click_count));

        monthRows.forEach((r) => {
          data[r.month] += r.clicks;
        });
        monthRows = [];
        monthsToShow.forEach((month) => {
          monthRows.push({ month, clicks: data[month] });
        });

        const chartData: (string | number)[][] = [
          ["Month", "Clicks"],
          ...monthRows.map((r) => [r.month, r.clicks]),
        ];
        console.log("Chart data:", chartData);
        console.log(rows);

        setData(chartData);
        setMaxClicks(max);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);
  console.log("Bar chart data:", data);
  const chartOptions = {
    colors: ["#2a9d90"],
    chartArea: { width: "70%", height: "70%" },
    height: 400,
    width: 600,
    hAxis: {
      title: "Total Clicks",
      format: "#,###",
      viewWindow: { min: 0 },
      ticks: (() => {
        const ticks = [];
        const step = Math.max(1, Math.floor(maxClicks / 5));
        for (let i = 0; i <= maxClicks; i += step) ticks.push(i);
        if (ticks[ticks.length - 1] !== maxClicks) ticks.push(maxClicks);
        return ticks;
      })(),
    },
    vAxis: {
      title: "Month",
      gridlines: { count: 5 },
    },
  };

  if (loading) return <p>Loading bar chart…</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (data.length <= 1) return <p>No click data for the last 12 months.</p>;

  return <Chart chartType="Bar" data={data} options={chartOptions} />;
};

export default BarChart;
