import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MailCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";
import { ApiErrorAlert } from "../../../components/ui/ApiErrorAlert";

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "your email address";
  const [info, setInfo] = useState<string | null>(null);

  const handleResend = () => {
    setInfo(`Verification email re-sent to ${email}. Please check your inbox.`);
  };

  return (
    <div className="space-y-6 text-center">
      <div className="w-14 h-14 bg-[#EFF6FF] dark:bg-[#172033] rounded-full flex items-center justify-center mx-auto text-[#2563EB] dark:text-[#60A5FA] border border-[#BFDBFE] dark:border-[#334155]">
        <MailCheck className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
          Verify Your Email
        </h1>
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
          We sent a verification link to <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">{email}</span>. Click the link in the email to activate your account.
        </p>
      </div>

      {info && <Alert type="info">{info}</Alert>}

      <div className="space-y-3 pt-2">
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={handleResend}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Resend Verification Email
        </Button>

        <Link to="/login" className="block">
          <Button
            variant="ghost"
            size="md"
            className="w-full"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Login
          </Button>
        </Link>
      </div>
    </div>
  );
};
