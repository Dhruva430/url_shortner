"use client";
import React from "react";
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
import ChartCard from "../chartCard";

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
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow p-4">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading options...</p>
          ) : isError ? (
            <p className="text-red-500 text-center">Error loading options</p>
          ) : (
            <FilterDropdown onSelect={handleSelect} options={options} />
          )}
        </div>

        {selectedShortcode ? (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 2xl:grid-cols-2">
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
              <ReusableLineChart
                fetchURL={lineChartFetchURL}
                lines={["clicks", "Links"]}
                lineLabels={{ clicks: "Latest Clicks", links: "Links Created" }}
                lineColors={{ clicks: "#00b3b3", links: "#f25c54" }}
              />
            </ChartCard>

            <ChartCard
              title="World Map"
              desc="Geographic distribution of link visits."
            >
              <WorldMap fetchURL={worldMapFetchURL} days={30} />
            </ChartCard>

            <ChartCard
              title="Monthly Clicks"
              desc="Total link clicks over the past year."
            >
              <div className="h-full flex items-center justify-center">
                <BarChart fetchURL={barChartFetchURL} />
              </div>
            </ChartCard>
          </div>
        ) : (
          <p className="text-center text-gray-500 text-sm">
            Select a link to view its analytics.
          </p>
        )}
      </div>
    </div>
  );
}

// Reusable Card
