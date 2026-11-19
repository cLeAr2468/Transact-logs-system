"use client";

import { useState, useEffect } from "react";
import Logo from "@/assets/nwssu 1.png";
import { NavLink, useLocation } from "react-router-dom";
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
import { clearSession } from "@/utils/session";
import { getNotifications } from "@/api/notificationApi";

import {
  LayoutDashboard,
  Users,
  UserCheckIcon,
  ArrowLeftRight,
  FileText,
  Megaphone,
  LogOut,
  UserCircle,
  Target,
  Activity,
  Bell,
} from "lucide-react";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    relatedRoutes: [],
  },
  {
    title: "Transaction",
    url: "/transact",
    icon: ArrowLeftRight,
    relatedRoutes: ["/add-transact", "/transact-details"],
  },
    {
    title: "Manage Purpose",
    url: "/manage-purpose",
    icon: Target,
    relatedRoutes: [],
  },
  {
    title: "Master list",
    url: "/master-list",
    icon: UserCheckIcon,
    relatedRoutes: ["/add-manual"],
  },
  {
    title: "Client",
    url: "/manage-client",
    icon: UserCheckIcon,
    relatedRoutes: ["/Client-register", "/client-details"],
  },

  {
    title: "Staff",
    url: "/manage-users",
    icon: Users,
    relatedRoutes: ["/add-staff"],
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
    relatedRoutes: ["/add-announcement", "/announcement-history"],
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
    relatedRoutes: [],
    showBadge: true,
  },
  {
    title: "Activity Logs",
    url: "/Activity",
    icon: Activity,
    relatedRoutes: [],
  },
      {
    title: "Profile",
    url: "/profile",
    icon: UserCircle,
    relatedRoutes: [],
  },

];

export function AppSidebar() {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const data = await getNotifications(1, 1); // Just get first item to check count
        setUnreadCount(data.unread_count || 0);
      } catch (error) {
        console.error('Error fetching unread count:', error);
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const getUserRole = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const roleValue =
          parsedUser?.role ||
          parsedUser?.user_role ||
          parsedUser?.accountType ||
          parsedUser?.userRole;

        if (roleValue) {
          return String(roleValue).toLowerCase();
        }
      }

      const storedRole = localStorage.getItem("role");
      if (storedRole) return String(storedRole).toLowerCase();

      const storedUserRole = localStorage.getItem("userRole");
      if (storedUserRole) return String(storedUserRole).toLowerCase();
    } catch {
      // ignore
    }

    return "";
  };

  const role = getUserRole();

  const visibleItems = items.filter((item) => {
    // Hide Staff menu for staff users
    if (item.title === "Staff" && ["staff", "employee", "user"].includes(role)) {
      return false;
    }
    // Show all other items (including Profile for both admin and staff)
    return true;
  });

  const isActiveRoute = (item) => {
    const currentPath = location.pathname;
    return currentPath === item.url || item.relatedRoutes.includes(currentPath);
  };

  return (
    <Sidebar className="border-none">
      <SidebarHeader className="bg-[#15592F] text-white p-4">
        <div className="flex items-center gap-3">
          <img src={Logo} alt="logo" className="w-16 h-16 object-contain" />

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

      <SidebarContent className="bg-[#15592F]">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const isActive = isActiveRoute(item);

                return (
                  <SidebarMenuItem key={item.title}>
                    <NavLink to={item.url}>
                      <SidebarMenuButton
                        className={`h-16 rounded-none px-5 text-[15px] flex items-center gap-3 cursor-pointer w-full relative
                        ${
                          isActive
                            ? "bg-yellow-500 text-black hover:bg-yellow-500 hover:text-black"
                            : "text-white hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <item.icon className="w-6 h-6 shrink-0" />
                        <span>{item.title}</span>
                        {item.showBadge && unreadCount > 0 && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </NavLink>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-[#15592F] p-4 border-t border-white/20 h-20 flex">
        <SidebarMenuButton 
          onClick={() => {
            clearSession();
            window.location.href = '/';
          }}
          className="h-14 text-white hover:bg-white/10 hover:text-white flex gap-3 justify-start px-3 cursor-pointer"
        >
          <div className="w-full h-6 shrink-0 flex items-center justify-center gap-3">
            <LogOut className="w-6 h-6 shrink-0" />
            <span className="text-[18px]">Log out</span>
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;