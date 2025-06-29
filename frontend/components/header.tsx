"use client";
import React, { useState } from "react";
import { Bell, Plus } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import CreateLinkDialog from "@/components/createLinkDialog";

export default function Header() {
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
    </header>
  );
}
