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
import { useRouter } from "next/navigation";

export default function AppSidebar() {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/logout", {
        method: "GET",
        credentials: "include",
      });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
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
      href: "/analytics",
      icon: <BarChart2 className="size-5" />,
      label: "Analytics",
    },
    {
      href: "/qr-codes",
      icon: <QrCode className="size-5" />,
      label: "QR Codes",
    },
    {
      href: "/settings",
      icon: <Settings className="size-5" />,
      label: "Settings",
    },
  ];

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    className="data-[slot=sidebar-menu-button]:!p-1.5"
                  >
                    <a href={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
                <DropdownMenuItem>Account</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
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
