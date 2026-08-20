"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar user={user} />
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        <DashboardHeader user={user} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
