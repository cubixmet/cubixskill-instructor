import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { ForgotPasswordForm } from "../components/ForgotPasswordForm";

export const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="w-full max-w-[430px] mx-auto space-y-4 sm:space-y-5 text-center font-sans">
      {/* 1. Back to Login */}
      <div className="text-left">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>
      </div>

      {/* 2. CubixSkill logo + Instructor label */}
      <div className="flex flex-col items-center space-y-1.5 pt-1">
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

      {/* 3 & 4. Forgot Password Heading & Supporting Text */}
      <div className="space-y-1">
        <h1 className="text-[28px] sm:text-[32px] font-bold text-[var(--text-primary)] tracking-tight leading-[1.1]">
          Forgot Password?
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal max-w-xs mx-auto leading-normal">
          Enter your email address and we'll send you a secure link to create a new password.
        </p>
      </div>

      {/* 5 & 6. Forgot Password Form (Email input + Send Reset Link button) */}
      <div className="text-left">
        <ForgotPasswordForm />
      </div>


    </div>
  );
};
