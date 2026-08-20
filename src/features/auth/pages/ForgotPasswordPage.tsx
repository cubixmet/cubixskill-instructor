import React from "react";
import { ForgotPasswordForm } from "../components/ForgotPasswordForm";

export const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
          Forgot Password?
        </h1>
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
          Enter your academy email to receive a password reset link
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
};
