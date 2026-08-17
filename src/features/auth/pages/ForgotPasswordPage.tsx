import React from "react";
import { ForgotPasswordForm } from "../components/ForgotPasswordForm";

export const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
          Forgot Password?
        </h1>
        <p className="text-sm text-[#64748B]">
          Enter your academy email to receive a password reset link
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
};
