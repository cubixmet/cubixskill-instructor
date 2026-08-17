import React from "react";
import { ResetPasswordForm } from "../components/ResetPasswordForm";

export const ResetPasswordPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
          Reset Your Password
        </h1>
        <p className="text-sm text-[#64748B]">
          Enter your new password below to update your account credentials
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  );
};
