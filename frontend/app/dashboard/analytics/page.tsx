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
    <>
      <div className="mb-4">
        {isLoading ? (
          <p>Loading options...</p>
        ) : isError ? (
          <p className="text-red-500">Error loading options</p>
        ) : (
          <FilterDropdown onSelect={handleSelect} options={options} />
        )}
      </div>

      {selectedShortcode ? (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Pie Chart */}
          <div className="rounded-lg border bg-white shadow-sm">
            <div className="p-6 pb-0 space-y-1.5">
              <h2 className="text-lg font-semibold tracking-tight text-black">
                Device Usage
              </h2>
              <p className="text-sm text-gray-500">
                Breakdown of devices used to visit your links.
              </p>
            </div>
            <DevicePieChart fetchURL={pieChartFetchURL} />
          </div>

          {/* Line Chart */}
          <div className="rounded-lg border bg-white shadow-sm">
            <div className="p-6 pb-0 space-y-1.5">
              <h2 className="text-lg font-semibold tracking-tight text-black">
                Link Performance
              </h2>
              <p className="text-sm text-gray-500">
                Growth of clicks and links created.
              </p>
            </div>
            <ReusableLineChart
              fetchURL={lineChartFetchURL}
              lines={["clicks", "Links"]}
              lineLabels={{
                clicks: "Latest Clicks",
                links: "Links Created",
              }}
              lineColors={{ clicks: "#00b3b3", links: "#f25c54" }}
            />
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
            {/* TODO: remove the api key */}
            <WorldMap fetchURL={worldMapFetchURL} days={30} />
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
            <div className="flex flex-grow items-center justify-center">
              <BarChart fetchURL={barChartFetchURL} />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 text-sm mt-6">
          Select a link to view its analytics.
        </p>
      )}
    </>
  );
}
