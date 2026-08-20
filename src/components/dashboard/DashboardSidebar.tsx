"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CreditCardIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  PhotoIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "@/lib/store/authStore";
import { useUIStore } from "@/lib/store/uiStore";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface SidebarProps {
  user: any;
}

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  const isActive = (path: string) => {
    if (path === "/reception" && pathname === "/reception") return true;
    if (path === "/manager" && pathname === "/manager") return true;
    if (path === "/owner" && pathname === "/owner") return true;
    if (path !== "/reception" && path !== "/manager" && path !== "/owner" && pathname?.startsWith(path)) return true;
    return false;
  };

  const receptionistLinks = [
    { href: "/reception", label: "Live Board", icon: HomeIcon },
    { href: "/reception/check-in", label: "Check-in", icon: PlusCircleIcon },
    { href: "/reception/check-out", label: "Check-out", icon: ClipboardDocumentListIcon },
    { href: "/reception/guests", label: "Guests", icon: UsersIcon },
    { href: "/reception/bookings", label: "Bookings", icon: CalendarIcon },
    { href: "/reception/payments", label: "Payments", icon: CreditCardIcon },
    { href: "/reception/rooms", label: "Rooms", icon: BuildingOfficeIcon },
  ];

  const managerLinks = [
    { href: "/manager", label: "Dashboard", icon: ChartBarIcon },
    { href: "/manager/rooms", label: "Rooms", icon: BuildingOfficeIcon },
    { href: "/manager/staff", label: "Staff", icon: UserGroupIcon },
    { href: "/manager/reports", label: "Reports", icon: DocumentTextIcon },
    { href: "/manager/content", label: "Content", icon: PhotoIcon },
    { href: "/manager/inquiries", label: "Inquiries", icon: EnvelopeIcon },
  ];

  const ownerLinks = [
    { href: "/owner", label: "Dashboard", icon: ChartBarIcon },
    { href: "/owner/analytics", label: "Analytics", icon: ChartBarIcon },
    { href: "/owner/users", label: "Users", icon: UserGroupIcon },
    { href: "/owner/settings", label: "Settings", icon: Cog6ToothIcon },
  ];

  const getLinks = () => {
    if (!user) return [];
    if (user.role === "ADMIN" || user.role === "OWNER") {
      return [...receptionistLinks, ...managerLinks, ...ownerLinks];
    }
    if (user.role === "MANAGER") {
      return [...receptionistLinks, ...managerLinks];
    }
    if (user.role === "RECEPTIONIST") {
      return receptionistLinks;
    }
    return [];
  };

  const links = getLinks();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout properly");
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-gray-900 text-white transform transition-all duration-300 ease-in-out ${
          collapsed ? "w-16" : "w-64"
        } ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 overflow-y-auto flex flex-col`}
      >
        <div className={`p-4 border-b border-gray-700 flex-shrink-0 ${collapsed ? "text-center" : ""}`}>
          <h1 className={`font-bold ${collapsed ? "text-lg" : "text-xl"}`}>
            {collapsed ? "🏨" : "StayCraft Hotel"}
          </h1>
          {!collapsed && (
            <>
              <p className="text-sm text-gray-400">Management System</p>
              <div className="mt-2 text-xs text-gray-500">
                {user?.full_name} • <span className="capitalize">{user?.role?.toLowerCase()}</span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 bg-gray-700 rounded-full p-1 text-white hover:bg-gray-600 transition-colors hidden lg:block"
        >
          {collapsed ? "→" : "←"}
        </button>

        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-4 lg:mt-0">
          {links.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? link.label : undefined}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${collapsed ? "mr-0" : "mr-3"}`} />
                {!collapsed && link.label}
              </Link>
            );
          })}

          <div className={`pt-4 mt-4 border-t border-gray-700 ${collapsed ? "text-center" : ""}`}>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`flex items-center px-3 py-2.5 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors w-full ${
                collapsed ? "justify-center" : ""
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={collapsed ? "Logout" : undefined}
            >
              <ArrowRightOnRectangleIcon className={`h-5 w-5 flex-shrink-0 ${collapsed ? "mr-0" : "mr-3"}`} />
              {!collapsed && (isLoggingOut ? "Logging out..." : "Logout")}
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
