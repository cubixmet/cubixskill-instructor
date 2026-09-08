import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, GraduationCap } from "lucide-react";
import { useValidatePasswordToken } from "../hooks/useValidatePasswordToken";
import { ResetPasswordForm } from "../components/ResetPasswordForm";
import { Spinner } from "../../../components/ui/Spinner";
import { Button } from "../../../components/ui/Button";

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { data, isLoading, isError } = useValidatePasswordToken(token);

  if (!token) {
    return (
      <div className="w-full max-w-[430px] mx-auto space-y-4 sm:space-y-5 text-center font-sans">
        <div className="text-left">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>
        </div>

        <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 rounded-full flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Missing Reset Token</h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xs mx-auto leading-normal">
            The password reset link is missing required authorization parameters. Please request a new link.
          </p>
        </div>

        <div className="pt-2">
          <Link to="/forgot-password" className="block">
            <Button type="button" size="lg" className="w-full h-[52px] rounded-[12px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-[var(--brand-primary-foreground)] font-bold text-sm">
              Request Password Link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-[430px] mx-auto text-center py-12 space-y-4 font-sans">
        <Spinner size="lg" className="mx-auto text-[var(--brand-primary)]" />
        <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
          Validating security token...
        </p>
      </div>
    );
  }

  if (isError || (data && !data.valid)) {
    return (
      <div className="w-full max-w-[430px] mx-auto space-y-4 sm:space-y-5 text-center font-sans">
        <div className="text-left">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>
        </div>

        <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 rounded-full flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Expired or Invalid Link</h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xs mx-auto leading-normal">
            This password reset token is either invalid, already used, or has expired. Password reset links are valid for a limited time for security.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Link to="/forgot-password" className="block">
            <Button type="button" size="lg" className="w-full h-[52px] rounded-[12px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-[var(--brand-primary-foreground)] font-bold text-sm">
              Request New Link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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

      {/* 3 & 4. Heading & Description */}
      <div className="space-y-1">
        <h1 className="text-[28px] sm:text-[32px] font-bold text-[var(--text-primary)] tracking-tight leading-[1.1]">
          Create New Password
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal max-w-xs mx-auto leading-normal">
          Set a new password for your account and continue your journey.
        </p>
      </div>

      {/* 5. Reset Password Form */}
      <div className="text-left">
        <ResetPasswordForm />
      </div>
    </div>
  );
};

