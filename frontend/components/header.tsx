"use client";
import React, { useState } from "react";
import { Bell, Plus } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import CreateLinkDialog from "@/components/createLinkDialog";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm ">
      <div className="flex items-center gap-3">
        <h1 className="p-3 text-2xl font-bold text-gray-900 tracking-tight">
          <SidebarTrigger />
          Dashboard
        </h1>
        <span className="text-sm text-gray-400 hidden sm:inline">
          Welcome back!
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1 right-1 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-darkBackground text-white hover:bg-black font-medium text-lg cursor-pointer transition duration-200 shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Create Link
        </button>
        <CreateLinkDialog open={open} onOpenChange={setOpen} />
      </div>
    </header>
  );
}
