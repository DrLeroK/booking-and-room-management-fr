"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ownerNavItems, managerNavItems, receptionNavItems } from "@/config/navigation";
import { PageLoader } from "@/components/common/LoadingSpinner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, checkAuth, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const isValid = await checkAuth();
      setIsChecking(false);
      if (!isValid) {
        router.push("/login");
      }
    };
    initAuth();
  }, [checkAuth, router]);

  // Role-based access control
  useEffect(() => {
    if (!isChecking && user) {
      const role = user.role;
      const path = pathname || "";

      const roleAccess: Record<string, string[]> = {
        ADMIN: ["/reception", "/manager", "/owner"],
        OWNER: ["/reception", "/manager", "/owner"],
        MANAGER: ["/reception", "/manager"],
        RECEPTIONIST: ["/reception"],
      };

      const allowedPaths = roleAccess[role] || [];
      const isAllowed = allowedPaths.some((allowedPath) =>
        path.startsWith(allowedPath)
      );

      if (!isAllowed && path !== "/") {
        const defaultPaths: Record<string, string> = {
          ADMIN: "/owner",
          OWNER: "/owner",
          MANAGER: "/manager",
          RECEPTIONIST: "/reception",
        };
        router.push(defaultPaths[role] || "/reception");
      }
    }
  }, [isChecking, user, pathname, router]);

  if (isChecking || isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getNavItems = () => {
    const path = pathname || "";

    // Receptionist is strictly locked to reception tools
    if (user.role === "RECEPTIONIST") {
      return receptionNavItems;
    }

    // Manager can access manager tools and reception tools
    if (user.role === "MANAGER") {
      if (path.startsWith("/reception")) {
        return [
          ...receptionNavItems,
          { title: "Operations", href: "/manager", iconName: "BarChart" },
        ];
      }
      return [
        ...managerNavItems,
        { title: "Front Desk", href: "/reception", iconName: "Home" },
      ];
    }

    // Owner and Admin have executive access across all modules
    if (path.startsWith("/reception")) {
      return [
        ...receptionNavItems,
        { title: "Operations", href: "/manager", iconName: "BarChart" },
        { title: "Executive", href: "/owner", iconName: "LineChart" },
      ];
    }
    if (path.startsWith("/manager")) {
      return [
        ...managerNavItems,
        { title: "Executive", href: "/owner", iconName: "LineChart" },
        { title: "Front Desk", href: "/reception", iconName: "Home" },
      ];
    }
    return [
      ...ownerNavItems,
      { title: "Operations", href: "/manager", iconName: "BarChart" },
      { title: "Front Desk", href: "/reception", iconName: "Home" },
    ];
  };

  const getDashboardTitle = () => {
    const path = pathname || "";
    if (path.startsWith("/owner")) {
      return "Executive Command";
    }
    if (path.startsWith("/manager")) {
      return "Operations Center";
    }
    return "Front Desk Reception";
  };

  return (
    <DashboardShell
      items={getNavItems()}
      title={getDashboardTitle()}
      badge={user.role}
    >
      {children}
    </DashboardShell>
  );
}
