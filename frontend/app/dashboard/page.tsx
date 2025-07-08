"use client";

import React, { useEffect, useState } from "react";
import { Link2, Eye, MonitorCheck, Calendar1 } from "lucide-react";
import DevicePieChart from "@/features/charts/pieChart";
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
        const res = await fetch(`/api/protected/analytics/summary`, {
          credentials: "include",
        });
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
    <div className="flex-1 space-y-4 p-6 pt-4">
      {/* --- Metric Cards --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-lg bg-gray-200/70"
            />
          ))
        ) : error ? (
          <p className="col-span-4 text-sm text-red-600">Error: {error}</p>
        ) : (
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

      {/* --- Charts --- */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pie */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="p-6 pb-0 space-y-1.5">
            <h2 className="text-lg font-semibold tracking-tight text-black">
              Device Usage
            </h2>
            <p className="text-sm text-gray-500">
              Breakdown of devices used to visit your links.
            </p>
          </div>
          <DevicePieChart />
        </div>

        {/* Line */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="p-6 pb-0 space-y-1.5">
            <h2 className="text-lg font-semibold tracking-tight text-black">
              Link Performance
            </h2>
            <p className="text-sm text-gray-500">
              Growth of clicks and links created.
            </p>
          </div>
          <LineChart />
        </div>

        {/* World Map */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="p-6 pb-0 space-y-1.5">
            <h2 className="text-lg font-semibold tracking-tight text-black">
              World Map
            </h2>
            <p className="text-sm text-gray-500">
              Geographic distribution of link visits.
            </p>
          </div>
          <WorldMap />
        </div>

        {/* Bar Chart */}
        <div className="rounded-lg border bg-white shadow-sm flex flex-col">
          <div className="p-6 pb-0 space-y-1.5">
            <h2 className="text-lg font-semibold tracking-tight text-black">
              Monthly Clicks
            </h2>
            <p className="text-sm text-gray-500">
              Total link clicks over the past year.
            </p>
          </div>
          <div className="flex flex-grow items-center justify-center ">
            <BarChart />
          </div>
        </div>
      </div>
    </div>
  );
}
