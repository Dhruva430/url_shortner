import React from "react";
import { Shield, Calendar1, ChartColumnBig, Link } from "lucide-react";
import ThemeDropdown from "@/components/linkOperationDropdown";
export default function LinksDashboard() {
  return (
    <>
      <div className="flex flex-col justify-center items-center space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold tracking-tight text-black flex items-center gap-2">
          <Link className="inline size-6" />
          <p>Your Links</p>
        </h3>
        <p className="text-sm text-gray-500">
          Manage your shortened links and track their performance
        </p>
      </div>

      <div className="p-6 mx-10 flex gap-2 rounded-lg border bg-white border-gray-300 text-gray-900 shadow-sm">
        <img
          src="https://pbs.twimg.com/profile_images/1627772571478331392/4IB0Hq6U_400x400.jpg"
          alt="Link Thumbnail"
          className="rounded-full size-12 object-cover"
        />
        <div className="w-full">
          <div className="flex  w-full justify-between">
            <h1 className="font-bold px-2">
              Beautiful & consistent icons || Luicide
            </h1>
            <ThemeDropdown />
          </div>
          <p className="text-sm text-gray-500 px-2">
            https://lucide.dev/icons/chart-no-axes-column-decreasing?search=calender
          </p>
          <a
            href="https://short.ly/abc123"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline break-all cursor-pointer text-sm pb-2 px-2"
          >
            https://short.ly/abc123
          </a>
          <div className="gap-4 flex ">
            <div className="flex gap-1">
              <ChartColumnBig className="size-5" />
              <p className="text-gray-500">100 Clicks</p>
            </div>
            <div className="flex gap-1">
              <Calendar1 className="size-5" />
              <p className="text-gray-500">24 jan 2020</p>
            </div>
            <div className="gap-3 flex items-center justify-center">
              <div className="bg-black text-xs  font-semibold text-white px-4 py-1  rounded-xl">
                Active
              </div>
              <div className="bg-white text-black border-1 border-gray-300 text-xs  font-semibold  px-4 py-1  flex items-center gap-1 rounded-xl">
                <Shield className="size-4 text-black" />
                Protected
              </div>
              <div className="bg-red-500 text-xs  font-semibold text-white px-4 py-1  rounded-xl">
                Expired
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
