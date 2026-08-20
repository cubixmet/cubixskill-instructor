import React from "react";
import { LoginForm } from "../components/LoginForm";

export const LoginPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
          Welcome Back
        </h1>
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
          Sign in to access your CubixSkill Academy account
        </p>
      </div>

      <LoginForm />
    </div>
  );
};
