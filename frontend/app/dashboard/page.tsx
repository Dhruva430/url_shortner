"use client";

import React, { useEffect, useState } from "react";
import { Link2, Eye, MonitorCheck, Calendar1, CreditCard } from "lucide-react";
import DevicePieChart from "@/features/charts/pieChart";
import LineChart from "@/features/charts/lineChart";
import { WorldMap } from "@/features/charts/worldMapChart";
import BarChart from "@/features/charts/barChart";
import { PaymentPortal } from "@/components/razorpay/paymentPortal";
import ChartCard from "./chartCard";

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
  const [showPay, setShowPay] = useState(false);

  const pieChartFetchURL = "/api/protected/analytics/devices";
  const lineChartFetchURL = "/api/protected/analytics/line";
  const worldMapFetchURL = "/api/protected/analytics/worldmap?days=30";
  const barChartFetchURL = "/api/protected/analytics/bar";

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
      icon: <Link2 className="size-6 text-red-500" />,
      bg: "bg-red-50",
    },
    {
      title: "Total Clicks",
      value: stats?.total_clicks,
      icon: <Eye className="size-6 text-blue-500" />,
      bg: "bg-blue-50",
    },
    {
      title: "Active Links",
      value: stats?.active_links,
      icon: <MonitorCheck className="size-6 text-green-500" />,
      bg: "bg-green-50",
    },
    {
      title: "Expired Links",
      value: stats?.expired_links,
      icon: <Calendar1 className="size-6 text-gray-500" />,
      bg: "bg-gray-50",
    },
  ];

  const formatNumber = (n?: number) =>
    n === undefined ? "-" : n.toLocaleString();

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* CTA */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowPay(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <CreditCard className="h-4 w-4" />
            Add Credits / Pay
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl bg-gray-200"
              />
            ))
          ) : error ? (
            <p className="col-span-4 text-sm text-red-600">Error: {error}</p>
          ) : (
            metricCards.map(({ title, value, icon, bg }, i) => (
              <div
                key={i}
                className={`rounded-xl border border-gray-200 ${bg} shadow-sm hover:shadow-md transition`}
              >
                <div className="flex items-center justify-between p-5">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">
                      {title}
                    </h3>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      {formatNumber(value)}
                    </p>
                  </div>
                  {icon}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <ChartCard
            title="Device Usage"
            desc="Breakdown of devices used to visit your links."
          >
            <DevicePieChart fetchURL={pieChartFetchURL} />
          </ChartCard>

          <ChartCard
            title="Link Performance"
            desc="Growth of clicks and links created."
          >
            <LineChart
              fetchURL={lineChartFetchURL}
              lines={["clicks", "links"]}
              lineLabels={{ clicks: "Clicks", links: "New Link Clicks" }}
              lineColors={{ clicks: "#00b3b3", links: "#f25c54" }}
            />
          </ChartCard>

          <ChartCard
            title="World Map"
            desc="Geographic distribution of link visits."
          >
            <WorldMap fetchURL={worldMapFetchURL} />
          </ChartCard>

          <ChartCard
            title="Monthly Clicks"
            desc="Total link clicks over the past year."
          >
            <div className="flex flex-grow items-center justify-center">
              <BarChart fetchURL={barChartFetchURL} />
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Payment Portal */}
      <PaymentPortal open={showPay} onClose={() => setShowPay(false)} />
    </div>
  );
}
