import Sidebar from "@/components/sidebar";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-black min-h-screen">{children}</main>
    </div>
  );
}
