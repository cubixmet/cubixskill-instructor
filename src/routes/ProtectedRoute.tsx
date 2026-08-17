import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { Spinner } from "../components/ui/Spinner";

const ALLOWED_ROLES = ["ACADEMY_ADMIN", "ACADEMY_STAFF"];

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isInitializing, user } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-3">
        <Spinner size="lg" />
        <p className="text-sm font-semibold text-[#64748B]">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!ALLOWED_ROLES.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

