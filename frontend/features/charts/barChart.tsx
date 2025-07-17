"use client";

import { useQuery } from "@tanstack/react-query";
import { Chart } from "react-google-charts";
import moment from "moment";

interface ApiRow {
  month: string | Date;
  click_count: number;
}

interface BarChartProps {
  fetchURL: string;
  title?: string;
  color?: string;
  width?: number;
  height?: number;
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

function formatBarChartData(rows: ApiRow[]) {
  const currentMonthNum = moment().month();
  const monthsToShow = [
    ...MONTH_ORDER.slice(currentMonthNum + 1),
    ...MONTH_ORDER.slice(0, currentMonthNum + 1),
  ];

  const monthClicks: Record<string, number> = Object.fromEntries(
    MONTH_ORDER.map((m) => [m, 0])
  );

  rows.forEach((row) => {
    const month = moment(row.month).format("MMM");
    if (monthClicks[month] !== undefined) {
      monthClicks[month] += row.click_count || 0;
    }
  });

  const formatted: [string, number][] = monthsToShow.map((month) => [
    month,
    monthClicks[month],
  ]);

  const max = Math.max(...formatted.map(([, count]) => count));

  return {
    chartData: [["Month", "Clicks"], ...formatted],
    max,
  };
}

const BarChart: React.FC<BarChartProps> = ({
  fetchURL,
  color = "#2a9d90",
  width = 600,
  height = 400,
}) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["barChart", fetchURL],
    queryFn: async () => {
      const res = await fetch(fetchURL, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json: ApiRow[] = await res.json();
      return formatBarChartData(json);
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  if (isLoading) return <p>Loading chart…</p>;
  if (isError)
    return <p className="text-red-600">Error: {(error as Error).message}</p>;
  if (!data || data.chartData.length <= 1) return <p>No data available.</p>;

  const chartOptions = {
    colors: [color],
    chartArea: { width: "70%", height: "70%" },
    width,
    height,
    hAxis: {
      title: "Total Clicks",
      format: "#,###",
      viewWindow: { min: 0 },
      ticks: (() => {
        const ticks = [];
        const step = Math.max(1, Math.floor(data.max / 5));
        for (let i = 0; i <= data.max; i += step) ticks.push(i);
        if (ticks[ticks.length - 1] !== data.max) ticks.push(data.max);
        return ticks;
      })(),
    },
    vAxis: {
      title: "Month",
      gridlines: { count: 5 },
    },
  };

  return (
    <div className="flex flex-col gap-2">
      <Chart chartType="Bar" data={data.chartData} options={chartOptions} />
    </div>
  );
};

export default BarChart;
