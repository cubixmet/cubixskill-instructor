import React from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden text-left">
      {/* Background ambient glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[440px] space-y-6 z-10"
      >
        {/* CubixSkill Logo Header */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-600/25">
              C
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              Cubix<span className="text-blue-600">Skill</span>
            </span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            CubixSkill Academy
          </span>
        </div>

        {/* Centered Auth Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/50">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} CubixSkill Enterprise Inc. All rights reserved.
        </div>
      </motion.div>
    </div>
  );
};
