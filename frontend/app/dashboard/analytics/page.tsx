"use client";

import type React from "react";
import DevicePieChart from "@/features/charts/pieChart";
import ReusableLineChart from "@/features/charts/lineChart";
import { WorldMap } from "@/features/charts/worldMapChart";
import BarChart from "@/features/charts/barChart";
import FilterDropdown from "./filter";
import {
  AnalyticsProvider,
  useAnalyticsContext,
} from "@/contexts/analyticsContext";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Globe, Smartphone, TrendingUp, Link } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Options = {
  id: string;
  title: string;
  shortcode: string;
};

export default function AnalyticsPage() {
  return (
    <AnalyticsProvider>
      <AnalyticsContent />
    </AnalyticsProvider>
  );
}

function AnalyticsContent() {
  const { selectedShortcode, setSelectedShortcode } = useAnalyticsContext();

  const lineChartFetchURL = `/api/protected/analytics/linechart/${selectedShortcode}`;
  const barChartFetchURL = `/api/protected/analytics/barchart/${selectedShortcode}`;
  const worldMapFetchURL = `/api/protected/analytics/worldchart/${selectedShortcode}?days=30`;
  const pieChartFetchURL = `/api/protected/analytics/piechart/${selectedShortcode}`;

  const {
    data: options = [],
    isLoading,
    isError,
  } = useQuery<Options[]>({
    queryKey: ["shortcodes"],
    queryFn: async () => {
      const res = await fetch("/api/protected/titles", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return res.json();
    },
  });

  const handleSelect = (option: Options) => {
    setSelectedShortcode(option.shortcode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-slate-600 mt-2 text-lg">
                Track your link performance and user engagement
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live Data
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm relative z-30 overflow-visible flex flex-col items-center">
          <CardHeader className="pb-4 flex flex-col items-center shrink-0 min-w-120">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Link className="w-5 h-5 text-blue-600" />
              Select Link to Analyze
            </CardTitle>
            <CardDescription>
              Choose a link from your collection to view detailed analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-600">Loading your links...</p>
              </div>
            ) : isError ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="w-5 h-5 bg-red-500 rounded-full"></div>
                <p className="text-red-600">
                  Error loading links. Please try again.
                </p>
              </div>
            ) : (
              <FilterDropdown onSelect={handleSelect} options={options} />
            )}
          </CardContent>
        </Card>

        {selectedShortcode ? (
          <div className="space-y-8">
            {/* Charts Grid */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Line Chart */}
              <ChartCard
                title="Performance Trends"
                description="Track clicks and link creation over time"
                icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
              >
                <ReusableLineChart
                  fetchURL={lineChartFetchURL}
                  lines={["clicks", "Links"]}
                  lineLabels={{
                    clicks: "Latest Clicks",
                    links: "Links Created",
                  }}
                  lineColors={{ clicks: "#3b82f6", links: "#ef4444" }}
                />
              </ChartCard>

              {/* Pie Chart */}
              <ChartCard
                title="Device Distribution"
                description="Breakdown of devices used to access your links"
                icon={<Smartphone className="w-5 h-5 text-green-600" />}
              >
                <DevicePieChart fetchURL={pieChartFetchURL} />
              </ChartCard>

              {/* World Map */}
              <ChartCard
                title="Global Reach"
                description="Geographic distribution of your audience"
                icon={<Globe className="w-5 h-5 text-purple-600" />}
                className="lg:col-span-2"
              >
                <WorldMap fetchURL={worldMapFetchURL} days={30} />
              </ChartCard>

              {/* Bar Chart */}
              <ChartCard
                title="Monthly Performance"
                description="Click volume trends over the past year"
                icon={<BarChart3 className="w-5 h-5 text-orange-600" />}
                className="lg:col-span-2"
              >
                <div className="h-100 flex items-center justify-center">
                  <BarChart fetchURL={barChartFetchURL} />
                </div>
              </ChartCard>
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
  icon,
  className = "",
}: {
  title: string;
  description: string;
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
        <CardDescription className="text-slate-600">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hidden">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2 ">
          No Link Selected
        </h3>
        <p className="text-slate-600 text-center max-w-md">
          Choose a link from the dropdown above to view detailed analytics
          including performance metrics, geographic data, and device usage.
        </p>
      </CardContent>
    </Card>
  );
}
