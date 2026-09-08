import React from "react";
import { Outlet } from "react-router-dom";
import { AuthThemeToggle } from "../features/auth/components/AuthThemeToggle";

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-[100dvh] w-full bg-[var(--background)] text-[var(--text-primary)] flex flex-col items-center justify-between px-4 py-4 sm:px-6 sm:py-8 relative overflow-x-hidden font-sans transition-colors duration-200 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      {/* Top right theme toggle */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
        <AuthThemeToggle />
      </div>

      {/* Ambient background waves */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[var(--brand-primary)]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[var(--brand-primary)]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[430px] min-w-0 mx-auto my-auto space-y-4 sm:space-y-6 z-10">
        <Outlet />
      </div>
    </div>
  );
};
