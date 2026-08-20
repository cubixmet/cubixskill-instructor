import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { OtpInput } from "../components/OtpInput";
import { Button } from "../../../components/ui/Button";
import { ApiErrorAlert } from "../../../components/ui/ApiErrorAlert";
import { Alert } from "../../../components/ui/Alert";

export const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError("Please enter all 6 digits of the verification code.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess("Verification successful! Redirecting...");
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 bg-[#EFF6FF] dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-[#BFDBFE] dark:border-[#334155]">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
          Enter Security Code
        </h1>
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
          We sent a 6-digit verification code to your email
        </p>
      </div>

      <ApiErrorAlert message={error} onClose={() => setError(null)} />
      {success && <Alert type="success">{success}</Alert>}

      <form onSubmit={handleVerify} className="space-y-6 text-left">
        <OtpInput value={otp} onChange={setOtp} error={error || undefined} />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
          disabled={isSubmitting || otp.length < 6}
        >
          Verify Code
        </Button>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] pt-2 border-t border-[#E2E8F0] dark:border-[#263244]">
          <button
            type="button"
            onClick={() => setSuccess("A new OTP code has been sent to your email.")}
            className="inline-flex items-center gap-1.5 font-medium text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Resend Code
          </button>

          <Link
            to="/login"
            className="inline-flex items-center gap-1 font-medium hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};
