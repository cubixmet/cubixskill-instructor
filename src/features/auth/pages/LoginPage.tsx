import React from "react";
import { LoginForm } from "../components/LoginForm";

export const LoginPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
          Welcome Back
        </h1>
        <p className="text-sm text-[#64748B]">
          Sign in to access your CubixSkill instructor portal
        </p>
      </div>

      <LoginForm />
    </div>
  );
};
