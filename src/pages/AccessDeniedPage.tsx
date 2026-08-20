import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LayoutDashboard } from "lucide-react";
import { Button } from "../components/ui/Button";

export interface AccessDeniedPageProps {
  reason?: "ROLE" | "PERMISSION" | "FEATURE";
  featureName?: string;
  permissionCode?: string;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  reason = "PERMISSION",
  featureName,
  permissionCode,
}) => {
  const getErrorMessage = () => {
    if (reason === "FEATURE") {
      return `The ${featureName ? `"${featureName}"` : "requested"} feature is currently disabled for your Academy workspace. Please contact your Academy Administrator to enable it.`;
    }
    if (reason === "PERMISSION") {
      return `Your user account lacks the required permission ${permissionCode ? `(${permissionCode})` : ""} to view this page or perform this action.`;
    }
    return "Your user role does not have authorization to access this section of the Academy workspace.";
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="max-w-md w-full bg-[#FFFFFF] dark:bg-[#111827] rounded-[14px] border border-[#E2E8F0] dark:border-[#263244] shadow-[0_2px_4px_rgba(15,23,42,0.03),0_8px_24px_rgba(15,23,42,0.05)] dark:shadow-[0_0_0_1px_rgba(37,99,235,0.04),0_8px_24px_rgba(37,99,235,0.06)] p-6 sm:p-8 space-y-6">
        <div className="w-16 h-16 bg-[#FEF2F2] dark:bg-[rgba(239,68,68,0.08)] rounded-2xl flex items-center justify-center mx-auto text-[#EF4444] dark:text-[#F87171] border border-[#FECACA] dark:border-[rgba(248,113,113,0.25)]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">Access Restricted</h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">{getErrorMessage()}</p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              leftIcon={<LayoutDashboard className="w-4 h-4" />}
            >
              Back to Dashboard
            </Button>
          </Link>
          <Link to="/" className="w-full sm:w-auto">
            <Button
              variant="ghost"
              size="md"
              className="w-full"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
