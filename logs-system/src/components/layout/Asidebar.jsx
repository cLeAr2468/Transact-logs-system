"use client";

import Logo from "@/assets/nwssu 1.png";
import { NavLink, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  Users,
  UserCheckIcon,
  ArrowLeftRight,
  FileText,
  Megaphone,
  LogOut,
} from "lucide-react";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    relatedRoutes: [],
  },
  {
    title: "Staff",
    url: "/manage-users",
    icon: Users,
    relatedRoutes: [],
  },
  {
    title: "Client",
    url: "/manage-client",
    icon: UserCheckIcon,
    relatedRoutes: ["/Client-register"],
  },
    {
    title: "Master list",
    url: "/master-list",
    icon: UserCheckIcon,
    relatedRoutes: ["/master-list"],
  },
  {
    title: "Transaction",
    url: "/transact",
    icon: ArrowLeftRight,
    relatedRoutes: ["/add-transact"],
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
    relatedRoutes: [],
  },
  {
    title: "Announcements",
    url: "/announce",
    icon: Megaphone,
    relatedRoutes: ["/add-announcement"],
  },
];

export function AppSidebar() {
  const location = useLocation();

  // Check if current route matches the item or any of its related routes
  const isActiveRoute = (item) => {
    const currentPath = location.pathname;
    return currentPath === item.url || item.relatedRoutes.includes(currentPath);
  };

  return (
    <Sidebar className="border-none">
      {/* Header */}
      <SidebarHeader className="bg-[#15592F] text-white p-4">
        <div className="flex items-center gap-3">
          <img
            src={Logo}
            alt="logo"
            className="w-16 h-16 object-contain"
          />

          <div>
            <h1 className="text-[11px] font-bold leading-tight uppercase">
              Northwest Samar State University San Jorge Campus
            </h1>

            <p className="text-[9px] text-white/70">
              Resilience • Integrity • Service • Excellence
            </p>
          </div>
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="bg-[#15592F]">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = isActiveRoute(item);

                return (
                  <SidebarMenuItem key={item.title}>
                    <NavLink to={item.url}>
                      <SidebarMenuButton
                        className={`h-16 rounded-none px-5 text-[15px] flex items-center gap-3 cursor-pointer w-full
                        
                        ${isActive
                            ? "bg-yellow-500 text-black hover:bg-yellow-500 hover:text-black"
                            : "text-white hover:bg-white/10 hover:text-white"
                          }`}
                      >
                        <item.icon className="w-6 h-6 shrink-0" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </NavLink>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="bg-[#15592F] p-4 border-t border-white/20 h-14 flex">
        <Link to="/">
          <SidebarMenuButton className="h-14 text-white hover:bg-white/10 hover:text-white flex items-center gap-3 justify-start px-3">
          <div className="w-fullh-6 shrink-0 flex items-center justify-center gap-3 mb-6">
            <LogOut className="w-6 h-6 shrink-0" />

            <span className="text-[18px]">Log out</span>
          </div>
          </SidebarMenuButton>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;