import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import type { UserRole } from "../../features/auth/types/auth.types";
import { AccessDeniedPage } from "../../pages/AccessDeniedPage";
import { Spinner } from "../ui/Spinner";

export interface CanProps {
  permission?: string | string[];
  mode?: "any" | "all";
  feature?: string;
  role?: UserRole | string | (UserRole | string)[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({
  permission,
  mode = "any",
  feature,
  role,
  fallback = null,
  children,
}) => {
  const { can, canAny, canAll, hasRole, hasFeature, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (feature && !hasFeature(feature)) {
    return <>{fallback}</>;
  }

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  if (permission) {
    if (Array.isArray(permission)) {
      const allowed = mode === "all" ? canAll(permission) : canAny(permission);
      if (!allowed) return <>{fallback}</>;
    } else {
      if (!can(permission)) return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

export interface PermissionGuardProps {
  permission: string | string[];
  mode?: "any" | "all";
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  mode = "any",
  fallback = null,
  children,
}) => {
  return (
    <Can permission={permission} mode={mode} fallback={fallback}>
      {children}
    </Can>
  );
};

export interface FeatureGuardProps {
  feature: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({ feature, fallback = null, children }) => {
  return (
    <Can feature={feature} fallback={fallback}>
      {children}
    </Can>
  );
};

export interface ProtectedRouteProps {
  allowedRoles?: (UserRole | string)[];
  requiredPermission?: string | string[];
  permissionMode?: "any" | "all";
  requiredFeature?: string;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  requiredPermission,
  permissionMode = "any",
  requiredFeature,
  children,
}) => {
  const location = useLocation();
  const { isAuthenticated, isInitializing, hasRole, can, canAny, canAll, hasFeature } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-[#2563EB]/10 rounded-2xl flex items-center justify-center text-[#2563EB] animate-pulse">
            <Spinner size="lg" />
          </div>
          <p className="text-sm font-semibold text-[#64748B]">Initializing Academy session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <AccessDeniedPage reason="ROLE" />;
  }

  if (requiredFeature && !hasFeature(requiredFeature)) {
    return <AccessDeniedPage reason="FEATURE" featureName={requiredFeature} />;
  }

  if (requiredPermission) {
    const permAllowed = Array.isArray(requiredPermission)
      ? permissionMode === "all"
        ? canAll(requiredPermission)
        : canAny(requiredPermission)
      : can(requiredPermission);

    if (!permAllowed) {
      return (
        <AccessDeniedPage
          reason="PERMISSION"
          permissionCode={Array.isArray(requiredPermission) ? requiredPermission.join(", ") : requiredPermission}
        />
      );
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
