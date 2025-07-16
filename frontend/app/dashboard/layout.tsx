"use client";
import React from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import Header from "@/components/header";
import { useAuth } from "@/features/auth/hooks/auth/authProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading]);
  if (isLoading || !isAuthenticated)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div>
          <p className="text-slate-300 text-lg animate-pulse">Loading...</p>
        </div>
      </div>
    );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <AppSidebar />

        <SidebarInset>
          {/* Top Header */}
          <Header />

          {/* Page content */}
          <main className="p-4">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
