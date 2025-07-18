"use client";

import React, { useEffect, useState } from "react";
import {
  Link2,
  Eye,
  MonitorCheck,
  Calendar1,
  CreditCard,
  MousePointer,
  TrendingUp,
  Link,
  Calendar,
  Smartphone,
  Globe,
  BarChart3,
} from "lucide-react";
import DevicePieChart from "@/features/charts/pieChart";

import { WorldMap } from "@/features/charts/worldMapChart";
import BarChart from "@/features/charts/barChart";
import { PaymentPortal } from "@/components/razorpay/paymentPortal";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { stat } from "fs";
import ReusableLineChart from "@/features/charts/lineChart";

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

  const formatNumber = (n?: number) =>
    n === undefined ? "-" : n.toLocaleString();

  return (
    <>
      <div className="flex justify-end">
        <button
          onClick={() => setShowPay(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          <CreditCard className="h-4 w-4" />
          Add Credits / Pay
        </button>
      </div>
      <div className="min-h-screen bg-gray-100 px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto md:max-w-7xl">
          <KPICard
            title="Total Clicks"
            value={stats?.total_clicks ? formatNumber(stats.total_clicks) : "-"}
            change="+12.5%"
            icon={<MousePointer className="w-5 h-5" />}
            trend="up"
          />
          <KPICard
            title="Total Links"
            value={stats?.total_links ? formatNumber(stats.total_links) : "-"}
            change="+8.2%"
            icon={<Link className="w-5 h-5" />}
            trend="up"
          />
          <KPICard
            title="Active Links"
            value={stats?.active_links ? formatNumber(stats.active_links) : "-"}
            change="+15.3%"
            icon={<Eye className="w-5 h-5" />}
            trend="up"
          />
          <KPICard
            title="Expired Links"
            value={
              stats?.expired_links ? formatNumber(stats.expired_links) : "-"
            }
            change="-2.1%"
            icon={<Calendar className="w-5 h-5" />}
            trend="down"
          />
        </div>

        <div className="max-w-7xl mx-auto space-y-8">
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
            ) : null}
          </div>

          {/* Charts */}
          <div className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Line Chart */}
              <ChartCard
                title="Performance Trends"
                desc="Track clicks and link creation over time"
                icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
              >
                <ReusableLineChart
                  fetchURL={lineChartFetchURL}
                  lines={["clicks", "links"]}
                  lineLabels={{
                    clicks: "Clicks",
                    links: "New Link Clicks",
                  }}
                  lineColors={{ clicks: "#00b3b3", links: "#f25c54" }}
                />
              </ChartCard>

              {/* Pie Chart */}
              <ChartCard
                title="Device Distribution"
                desc="Breakdown of devices used to access your links"
                icon={<Smartphone className="w-5 h-5 text-green-600" />}
              >
                <DevicePieChart fetchURL={pieChartFetchURL} />
              </ChartCard>

              {/* World Map */}
              <ChartCard
                title="Global Reach"
                desc="Geographic distribution of your audience"
                icon={<Globe className="w-5 h-5 text-purple-600" />}
                className="lg:col-span-2"
              >
                <WorldMap fetchURL={worldMapFetchURL} days={30} />
              </ChartCard>

              {/* Bar Chart */}
              <ChartCard
                title="Monthly Performance"
                desc="Click volume trends over the past year"
                icon={<BarChart3 className="w-5 h-5 text-orange-600" />}
                className="lg:col-span-2"
              >
                <div className="h-100 flex items-center justify-center">
                  <BarChart fetchURL={barChartFetchURL} />
                </div>
              </ChartCard>
            </div>
          </div>
        </div>

        {/* Payment Portal */}
        <PaymentPortal open={showPay} onClose={() => setShowPay(false)} />
      </div>
    </>
  );
}
function KPICard({
  title,
  value,
  change,
  icon,
  trend,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: "up" | "down";
}) {
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                trend === "up"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">{title}</p>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`text-sm font-medium ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {change}
          </span>
          <span className="text-sm text-slate-500">vs last period</span>
        </div>
      </CardContent>
    </Card>
  );
}
function ChartCard({
  title,
  desc,
  children,
  icon,
  className = "",
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={`border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          {icon}
          {title}
        </CardTitle>
        <CardDescription className="text-slate-600">{desc}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}
