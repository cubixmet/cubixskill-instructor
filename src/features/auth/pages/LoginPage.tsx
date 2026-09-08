import React from "react";
import { GraduationCap } from "lucide-react";
import { LoginForm } from "../components/LoginForm";

export const LoginPage: React.FC = () => {
  return (
    <div className="w-full max-w-[430px] mx-auto space-y-5 sm:space-y-6 text-center font-sans">
      {/* 1. Compact Logo & Instructor Label */}
      <div className="flex flex-col items-center space-y-1.5 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[var(--brand-primary)] rounded-xl flex items-center justify-center text-[var(--brand-primary-foreground)] shadow-xs">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="text-left leading-none">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Cubix<span className="text-[var(--brand-primary)]">Skill</span>
            </span>
            <span className="block text-[11px] font-semibold text-[var(--text-muted)] tracking-wider uppercase mt-0.5">
              Instructor
            </span>
          </div>
        </div>
      </div>

      {/* 2. Welcome Heading & Short Description */}
      <div className="space-y-1">
        <h1 className="text-[28px] sm:text-[32px] font-bold text-[var(--text-primary)] tracking-tight leading-[1.1]">
          Welcome Back!
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal max-w-xs mx-auto leading-normal">
          Login to your Instructor account and continue managing your academy.
        </p>
      </div>

      {/* 3. Login Form */}
      <div className="text-left">
        <LoginForm />
      </div>


    </div>
  );
};
