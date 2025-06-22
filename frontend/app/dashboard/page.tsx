"use client";
import React from "react";
import { Link2, Eye, MonitorCheck, Calendar1 } from "lucide-react";
import HardcodedPieChart from "@/features/charts/pieChart";
import LineChart from "@/features/charts/lineChart";
import { WorldMap } from "@/features/charts/worldMapChart";
import BarChart from "@/features/charts/barChart";

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Links",
            value: 2,
            icon: <Link2 className="size-6 text-gray-500" />,
            bg: "bg-red",
          },
          {
            title: "Total Clicks",
            value: 232,
            icon: <Eye className="size-6 text-gray-500" />,
            bg: "bg-blue-100",
          },
          {
            title: "Active Links",
            value: 10,
            icon: <MonitorCheck className="size-6 text-gray-500" />,
            bg: "bg-green-100",
          },
          {
            title: "Expired Links",
            value: 4,
            icon: <Calendar1 className="size-6 text-gray-500" />,
            bg: "bg-gray-100",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className={`rounded-lg border-[1px] border-gray-200 ${item.bg} shadow-sm`}
          >
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h2 className="tracking-tight text-sm font-medium text-black">
                {item.title}
              </h2>
              {item.icon}
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-black">{item.value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <div className="rounded-lg border bg-white  shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-lg font-semibold tracking-tight text-black">
              Link Clicks
            </h2>
            <p className="text-sm text-gray-500">
              This chart shows the number of clicks on your links over time.
            </p>
          </div>

          <HardcodedPieChart />
        </div>
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-lg font-semibold tracking-tight text-black">
              Link Performance
            </h2>
            <p className="text-sm text-gray-500">
              This chart shows the performance of your links over time.
            </p>
            <LineChart />
          </div>
        </div>
        <div className="rounded-lg border bg-white shadow-sm p-4 ">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-lg font-semibold tracking-tight text-black">
              World Map
            </h2>
            <p className="text-sm text-gray-500">
              This map shows the distribution of your link clicks across the
              world.
            </p>
            <WorldMap />
          </div>
        </div>
        <div className="rounded-lg border bg-white shadow-sm p-4">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-lg font-semibold tracking-tight text-black">
              Bar Chart
            </h2>
            <p className="text-sm text-gray-500">
              This chart shows the number of clicks on your links over the
              years.
            </p>
            <BarChart />
          </div>
        </div>
      </div>
    </div>
  );
}
