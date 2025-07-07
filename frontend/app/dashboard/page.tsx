"use client";

import React, { useEffect, useState } from "react";
import { Link2, Eye, MonitorCheck, Calendar1 } from "lucide-react";
import HardcodedPieChart from "@/features/charts/pieChart";
import LineChart from "@/features/charts/lineChart";
import { WorldMap } from "@/features/charts/worldMapChart";
import BarChart from "@/features/charts/barChart";

interface DashboardStats {
  total_links: number;
  total_clicks: number;
  active_links: number;
  expired_links: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/protected/analytics/summary`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json: DashboardStats = await res.json();
        setStats(json);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const metricCards = [
    {
      title: "Total Links",
      value: stats?.total_links,
      icon: <Link2 className="size-6 text-gray-500" />,
      bg: "bg-red-100",
    },
    {
      title: "Total Clicks",
      value: stats?.total_clicks,
      icon: <Eye className="size-6 text-gray-500" />,
      bg: "bg-blue-100",
    },
    {
      title: "Active Links",
      value: stats?.active_links,
      icon: <MonitorCheck className="size-6 text-gray-500" />,
      bg: "bg-green-100",
    },
    {
      title: "Expired Links",
      value: stats?.expired_links,
      icon: <Calendar1 className="size-6 text-gray-500" />,
      bg: "bg-gray-100",
    },
  ];

  const formatNumber = (n?: number) =>
    n === undefined ? "-" : n.toLocaleString();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* ----- Metric cards ----- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          // skeleton placeholders
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-lg bg-gray-200/70"
            />
          ))
        ) : error ? (
          // show error
          <p className="col-span-4 text-sm text-red-600">Error: {error}</p>
        ) : (
          // real cards
          metricCards.map(({ title, value, icon, bg }, idx) => (
            <div
              key={idx}
              className={`rounded-lg border border-gray-200 ${bg} shadow-sm`}
            >
              <div className="flex items-center justify-between p-6 pb-2">
                <h2 className="text-sm font-medium tracking-tight text-black">
                  {title}
                </h2>
                {icon}
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold text-black">
                  {formatNumber(value)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ----- Charts ----- */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pie */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="p-6 space-y-1.5">
            <h2 className="text-lg font-semibold tracking-tight text-black">
              Link Clicks
            </h2>
            <p className="text-sm text-gray-500">
              Number of clicks on your links over time.
            </p>
          </div>
          <HardcodedPieChart />
        </div>

        {/* Line */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="p-6 space-y-1.5">
            <h2 className="text-lg font-semibold tracking-tight text-black">
              Link Performance
            </h2>
            <p className="text-sm text-gray-500">
              Growth of clicks and links created.
            </p>
            <LineChart />
          </div>
        </div>

        {/* World map */}
        <div className="rounded-lg border bg-white shadow-sm p-4">
          <div className="p-6 space-y-1.5">
            <h2 className="text-lg font-semibold tracking-tight text-black">
              World Map
            </h2>
            <p className="text-sm text-gray-500">
              Distribution of link clicks across the globe.
            </p>
            <WorldMap />
          </div>
        </div>

        {/* Bar */}
        <div className="rounded-lg border bg-white shadow-sm p-4">
          <div className="p-6 space-y-1.5">
            <h2 className="text-lg font-semibold tracking-tight text-black">
              Monthly Clicks
            </h2>
            <p className="text-sm text-gray-500">
              Click totals for each month.
            </p>
            <BarChart />
          </div>
        </div>
      </div>
    </div>
  );
}
