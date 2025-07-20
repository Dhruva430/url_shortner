"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

import {
  Home,
  Link as LinkIcon,
  BarChart2,
  QrCode,
  Settings,
  User2,
  ChevronUp,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import clsx from "clsx";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "GET",
        credentials: "include",
      });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const base =
    "data-[slot=sidebar-menu-button]:!p-6 shadow flex items-center gap-3 transition-colors";

  const active = "bg-[#aedde5] text-black";
  const idle = "text-white hover:bg-gray-700 hover:text-white";

  const items = [
    {
      href: "/dashboard",
      icon: <Home className="size-5" />,
      label: "Dashboard",
    },
    {
      href: "/dashboard/links",
      icon: <LinkIcon className="size-5" />,
      label: "Links",
    },
    {
      href: "/dashboard/analytics",
      icon: <BarChart2 className="size-5" />,
      label: "Analytics",
    },
    {
      href: "/dashboard/qr_code",
      icon: <QrCode className="size-5" />,
      label: "QR Codes",
    },
  ];

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader />

      <SidebarContent>
        <SidebarGroup>
          <span className="h-px w-full block bg-gray-500" />
          <SidebarGroupLabel className="!px-4 !py-4 font-bold">
            Application
          </SidebarGroupLabel>
          <span className="h-px w-full block bg-gray-500" />
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      className={clsx(base, isActive ? active : idle)}
                    >
                      <a href={item.href}>
                        {item.icon}
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 className="size-4" />
                  <span>Username</span>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/account">Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/billings">Billing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
