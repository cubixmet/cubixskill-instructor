import React from "react";
import { useAuth } from "../../auth/hooks/useAuth";

export interface DashboardPermissionGuardProps {
  permission?: "revenue" | "students" | "courses" | "credits" | "staff";
  allowedRoles?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const DashboardPermissionGuard: React.FC<DashboardPermissionGuardProps> = ({
  permission,
  allowedRoles,
  children,
  fallback = null,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <>{fallback}</>;

  // Check explicit allowed roles if provided
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role || "instructor";
    if (!allowedRoles.includes(userRole)) {
      return <>{fallback}</>;
    }
  }

  // Check specific domain permissions
  if (permission) {
    const userRole = (user?.role || "instructor") as string;

    if (permission === "revenue" && userRole === "ta") {
      return <>{fallback}</>;
    }

    if (permission === "staff" && userRole !== "admin" && userRole !== "instructor") {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
