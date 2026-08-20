import React from "react";
import { ChangePasswordForm } from "../components/ChangePasswordForm";
import { KeyRound } from "lucide-react";

export const ChangePasswordPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-[#E2E8F0] dark:border-[#263244]">
        <div className="p-2.5 bg-[#EFF6FF] dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] rounded-xl border border-[#BFDBFE] dark:border-[#334155]">
          <KeyRound className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Change Account Password
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
            Update your password to keep your Academy Staff / Admin account secure
          </p>
        </div>
      </div>

      <div className="bg-[#FFFFFF] dark:bg-[#111827] p-5 sm:p-6 rounded-[14px] border border-[#E2E8F0] dark:border-[#263244] shadow-[0_2px_4px_rgba(15,23,42,0.03),0_8px_24px_rgba(15,23,42,0.05)] dark:shadow-[0_0_0_1px_rgba(37,99,235,0.04),0_8px_24px_rgba(37,99,235,0.06)]">
        <ChangePasswordForm />
      </div>
    </div>
  );
};
