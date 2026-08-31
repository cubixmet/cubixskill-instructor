import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { Spinner } from "../components/ui/Spinner";

export const PublicRoute: React.FC = () => {
  const { isAuthenticated, isInitializing, authStatus } = useAuth();

  if (isInitializing || authStatus === "checking") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-3">
        <Spinner size="lg" />
        <p className="text-sm font-semibold text-[#64748B]">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated || authStatus === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
