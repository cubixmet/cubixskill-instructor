import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, LogIn } from "lucide-react";
import { Button } from "../../../components/ui/Button";

export const PasswordUpdatedSuccessPage: React.FC = () => {
  return (
    <div className="space-y-6 text-center">
      <div className="w-14 h-14 bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.08)] rounded-full flex items-center justify-center mx-auto text-[#10B981] dark:text-[#6EE7B7] border border-[#A7F3D0] dark:border-[rgba(52,211,153,0.24)]">
        <CheckCircle2 className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
          Password Updated
        </h1>
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed max-w-sm mx-auto">
          Your password has been changed successfully. You can now sign in with your new credentials.
        </p>
      </div>

      <div className="pt-2">
        <Link to="/login" className="block">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            Sign In Now
          </Button>
        </Link>
      </div>
    </div>
  );
};
