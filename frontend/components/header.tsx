"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React, { useState, useMemo } from "react";
import CreateLinkDialog from "@/components/createLinkDialog";
import { useLinks } from "@/features/links/hooks/useLinks";
import { usePathname } from "next/navigation";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { refetch } = useLinks();
  const pathname = usePathname();

  const pageTitle = useMemo(() => {
    if (pathname.includes("/dashboard/links")) return "Links";
    if (pathname.includes("/dashboard/analytics")) return "Analytics";
    if (pathname.includes("/dashboard/qr_code")) return "QR Codes";
    if (pathname.includes("/settings")) return "Settings";
    if (pathname.includes("/dashboard")) return "Dashboard";
    return "Dashboard";
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 w-full z-10 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {pageTitle}
          </h1>
        </div>
        <div className="absolute  top-3 right-4 z-20">
          <Button
            onClick={() => setOpen(true)}
            size="lg"
            className="gap-2 px-8 bg-darkBackground cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Create New Link
          </Button>
        </div>
      </header>
      <CreateLinkDialog
        open={open}
        onOpenChange={setOpen}
        onCreateLink={refetch}
      />
    </>
  );
}
