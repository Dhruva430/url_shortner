"use client";
import React, { useState } from "react";
import {
  Home,
  Link as LinkIcon,
  BarChart2,
  QrCode,
  Settings,
  Plus,
  User,
} from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/popover";

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <div className="w-64 min-h-screen bg-darkBackground flex flex-col border-r px-6 py-6">
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-accent"
        onClick={() => setOpen(false)}
        aria-label="Hide sidebar"
      ></button>
      <div className="flex items-center gap-2 mb-8">
        <LinkIcon className="w-6 h-6 text-accent" />
        <span className="font-bold text-lg tracking-tight">Shrink.r</span>
      </div>
      <nav className="flex-1">
        <div>
          <div className="text-sm text-gray-400 mb-2">Navigation</div>
          <ul className="space-y-1">
            {[
              {
                href: "/dashboard",
                icon: <Home className="size-5" />,
                label: "Dashboard",
              },
              {
                href: "/links",
                icon: <LinkIcon className="size-5" />,
                label: "Links",
              },
              {
                href: "analytics",
                icon: <BarChart2 className="size-5" />,
                label: "Analytics",
              },
              {
                href: "qr-codes",
                icon: <QrCode className="size-5" />,
                label: "QR Codes",
              },
              {
                href: "settings",
                icon: <Settings className="size-5" />,
                label: "Settings",
              },
            ].map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-hoverColor"
                >
                  {item.icon}
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8">
          <div className="text-sm text-gray-400 mb-2">Quick Actions</div>
          <a
            href="#"
            className="flex items-center gap-2 px-3 py-2 rounded-lg  font-medium text-white hover:bg-hoverColor"
          >
            <Plus className="size-5" />
            Create Link
          </a>
        </div>
      </nav>
      <div className="flex items-center gap-2 mt-auto mb-2">
        <span className="size-7 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="w-4 h-4 text-gray-400" />
        </span>

        <Popover>
          <PopoverTrigger asChild>
            <button>Username</button>
          </PopoverTrigger>
          <PopoverContent className="w-64 left-0 p-4 border-none">
            <div className="px-1 py-2 bg-white w-full rounded-sm">
              <div className="text-small font-bold text-black text-center">
                My Account
              </div>
              <span className="h-px w-full block bg-gray-100 my-2" />
              <div className="text-small text-black text-center hover:bg-hoverColor rounded-sm">
                Profile
              </div>
              <div className="text-small text-black text-center hover:bg-hoverColor rounded-sm">
                Settings
              </div>
              <span className="h-px w-full block bg-gray-100 my-2" />
              <div className="text-small text-black text-center hover:bg-hoverColor rounded-sm">
                Sign out
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
