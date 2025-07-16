"use client";
import React from "react";
import DevicePieChart from "@/features/charts/pieChart";
import LineChart from "@/features/charts/lineChart";
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
  // console.log("Context created", selectedShortcode);
  return (
    <AnalyticsProvider>
      <AnalyticsContent />
    </AnalyticsProvider>
  );
}

function AnalyticsContent() {
  const { selectedShortcode, setSelectedShortcode } = useAnalyticsContext();
  console.log("selectedShortcode (render):", selectedShortcode);

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
    console.log("Selected from dropdown:", option);
    setSelectedShortcode(option.shortcode);
  };

  return (
    <>
      <div className="">
        {isLoading ? (
          <p>Loading options...</p>
        ) : isError ? (
          <p>Error loading options</p>
        ) : (
          <FilterDropdown onSelect={handleSelect} options={options} />
        )}
      </div>

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
          {selectedShortcode && (
            <DevicePieChart
              shortcode={selectedShortcode}
              title="Device Types"
            />
          )}
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
          <LineChart
            endpoint="/api/protected/analytics/line"
            queryParams={{ days: "7" }}
            lines={["clicks", "links"]}
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
          <div className="flex flex-grow items-center justify-center">
            <BarChart />
          </div>
        </div>
      </div>
    </>
  );
}
