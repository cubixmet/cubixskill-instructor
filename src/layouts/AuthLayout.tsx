import React from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthThemeToggle } from "../features/auth/components/AuthThemeToggle";

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-[100dvh] w-full bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col items-center justify-center px-3 py-6 sm:px-6 relative overflow-x-hidden font-sans transition-colors duration-200">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <AuthThemeToggle />
      </div>

      {/* Subtle ambient glows for professional feel */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-500/5 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md min-w-0 space-y-6 z-10 my-auto"
      >
        {/* CubixSkill Logo & Branding Header */}
        <div className="flex flex-col items-center space-y-2.5 text-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#2563EB] to-[#3B82F6] rounded-xl flex items-center justify-center text-white font-semibold text-xl shadow-sm">
              C
            </div>
            <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
              Cubix<span className="text-[#2563EB] dark:text-[#3B82F6]">Skill</span>
            </span>
          </div>
          <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wider bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] px-3 py-1 rounded-full shadow-2xs">
            CubixSkill Academy
          </span>
        </div>

        {/* Centered Theme-Aware Auth Card */}
        <div className="bg-[#FFFFFF] dark:bg-[#111827] p-5 sm:p-8 rounded-[14px] border border-[#E2E8F0] dark:border-[#263244] shadow-[0_2px_4px_rgba(15,23,42,0.03),0_8px_24px_rgba(15,23,42,0.05)] dark:shadow-[0_0_0_1px_rgba(37,99,235,0.04),0_8px_24px_rgba(37,99,235,0.06)] transition-all duration-200">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[#94A3B8] dark:text-[#64748B] font-normal">
          &copy; {new Date().getFullYear()} CubixSkill Enterprise Inc. All rights reserved.
        </div>
      </motion.div>
    </div>
  );
};
