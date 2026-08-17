import React from "react";
import { ChangePasswordForm } from "../components/ChangePasswordForm";
import { KeyRound } from "lucide-react";

export const ChangePasswordPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-[#E2E8F0]">
        <div className="p-2.5 bg-[#EFF6FF] text-[#2563EB] rounded-xl border border-[#BFDBFE]">
          <KeyRound className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Change Account Password
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Update your password to keep your Academy Staff / Admin account secure
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
        <ChangePasswordForm />
      </div>
    </div>
  );
};
