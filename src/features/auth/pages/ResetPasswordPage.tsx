import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ShieldAlert, KeyRound, ArrowLeft } from "lucide-react";
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
      <div className="text-center space-y-5">
        <div className="w-14 h-14 bg-[#FEF2F2] dark:bg-[rgba(239,68,68,0.08)] rounded-full flex items-center justify-center mx-auto text-[#EF4444] dark:text-[#F87171] border border-[#FECACA] dark:border-[rgba(248,113,113,0.25)]">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Missing Reset Token</h2>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
            The password reset link is missing required authorization parameters. Please request a new link.
          </p>
        </div>
        <Link to="/forgot-password" className="inline-block">
          <Button variant="primary" size="md">
            Request Password Link
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12 space-y-4">
        <Spinner size="lg" className="mx-auto text-[#2563EB] dark:text-[#60A5FA]" />
        <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
          Validating security token...
        </p>
      </div>
    );
  }

  if (isError || (data && !data.valid)) {
    return (
      <div className="text-center space-y-5">
        <div className="w-14 h-14 bg-[#FEF2F2] dark:bg-[rgba(239,68,68,0.08)] rounded-full flex items-center justify-center mx-auto text-[#EF4444] dark:text-[#F87171] border border-[#FECACA] dark:border-[rgba(248,113,113,0.25)]">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Expired or Invalid Link</h2>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
            This password reset token is either invalid, already used, or has expired. Password reset links are valid for a limited time for security.
          </p>
        </div>
        <div className="space-y-3 pt-2">
          <Link to="/forgot-password" className="block">
            <Button variant="primary" size="md" className="w-full">
              Request New Link
            </Button>
          </Link>
          <Link to="/login" className="block">
            <Button variant="ghost" size="sm" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 bg-[#EFF6FF] dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-[#BFDBFE] dark:border-[#334155]">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
          Reset Your Password
        </h1>
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
          Enter your new password below to update your account credentials
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  );
};
