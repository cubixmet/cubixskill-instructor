import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ShieldAlert, KeyRound, ArrowLeft } from "lucide-react";
import { useValidatePasswordToken } from "../hooks/useValidatePasswordToken";
import { PasswordSetupForm } from "../components/PasswordSetupForm";
import { Spinner } from "../../../components/ui/Spinner";
import { Button } from "../../../components/ui/Button";

export const SetupPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { data, isLoading, isError } = useValidatePasswordToken(token);

  if (!token) {
    return (
      <div className="text-center space-y-5">
        <div className="w-14 h-14 bg-[#FEF2F2] rounded-full flex items-center justify-center mx-auto text-[#DC2626] border border-[#FCA5A5]">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#0F172A]">Missing Security Token</h2>
          <p className="text-sm text-[#64748B] max-w-sm mx-auto">
            The password setup link is missing required authorization parameters. Please request a new setup link.
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
        <Spinner size="lg" className="mx-auto" />
        <p className="text-sm font-medium text-[#64748B]">
          Validating security token...
        </p>
      </div>
    );
  }

  if (isError || (data && !data.valid)) {
    return (
      <div className="text-center space-y-5">
        <div className="w-14 h-14 bg-[#FEF2F2] rounded-full flex items-center justify-center mx-auto text-[#DC2626] border border-[#FCA5A5]">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#0F172A]">Expired or Invalid Link</h2>
          <p className="text-sm text-[#64748B] max-w-sm mx-auto">
            This password setup token is either invalid or has expired. Password links are valid for a limited time for security.
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
        <div className="w-12 h-12 bg-[#EFF6FF] text-[#2563EB] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-[#BFDBFE]">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
          Setup Your Password
        </h1>
        <p className="text-sm text-[#64748B]">
          Create a secure password for your CubixSkill instructor account
        </p>
      </div>

      <PasswordSetupForm token={token} />
    </div>
  );
};
