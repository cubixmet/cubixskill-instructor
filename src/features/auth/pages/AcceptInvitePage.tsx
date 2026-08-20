import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { UserCheck, ArrowLeft } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";

export const AcceptInvitePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email") || "instructor@academy.com";
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/setup-password?token=${token || "demo-token"}`);
    }, 800);
  };

  return (
    <div className="space-y-6 text-center">
      <div className="w-14 h-14 bg-[#EFF6FF] dark:bg-[#172033] rounded-full flex items-center justify-center mx-auto text-[#2563EB] dark:text-[#60A5FA] border border-[#BFDBFE] dark:border-[#334155]">
        <UserCheck className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
          Accept Instructor Invitation
        </h1>
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
          You have been invited to join CubixSkill Academy as an instructor. Accept the invitation to set up your password.
        </p>
      </div>

      <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#263244] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#CBD5E1]">
        Invited Account: <span className="font-semibold text-[#2563EB] dark:text-[#60A5FA]">{email}</span>
      </div>

      <div className="space-y-3 pt-2">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleAccept}
          isLoading={isLoading}
        >
          Accept Invitation & Set Password
        </Button>

        <Link to="/login" className="block">
          <Button
            variant="ghost"
            size="md"
            className="w-full"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Decline / Back to Login
          </Button>
        </Link>
      </div>
    </div>
  );
};
