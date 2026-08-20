import React from "react";
import { Check, X } from "lucide-react";
import { passwordRequirementsRegex } from "../schemas/auth.schema";

export interface PasswordStrengthProps {
  password?: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password = "" }) => {
  const requirements = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One uppercase letter (A-Z)", valid: passwordRequirementsRegex.uppercase.test(password) },
    { label: "One lowercase letter (a-z)", valid: passwordRequirementsRegex.lowercase.test(password) },
    { label: "One number (0-9)", valid: passwordRequirementsRegex.number.test(password) },
    { label: "One special character (!@#$%...)", valid: passwordRequirementsRegex.special.test(password) },
  ];

  const passedCount = requirements.filter((r) => r.valid).length;

  const getStrengthColor = () => {
    if (passedCount <= 2) return "bg-[#EF4444] dark:bg-[#F87171]";
    if (passedCount <= 4) return "bg-amber-500";
    return "bg-[#10B981]";
  };

  const getStrengthLabel = () => {
    if (passedCount <= 2) return "Weak";
    if (passedCount <= 4) return "Medium";
    return "Strong";
  };

  return (
    <div className="space-y-3 p-3.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#263244] rounded-xl text-left transition-colors duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Password Strength</span>
        {password.length > 0 && (
          <span
            className={`text-xs font-semibold ${
              passedCount <= 2
                ? "text-[#EF4444] dark:text-[#F87171]"
                : passedCount <= 4
                ? "text-amber-500 dark:text-amber-400"
                : "text-[#10B981] dark:text-[#6EE7B7]"
            }`}
          >
            {getStrengthLabel()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step <= passedCount ? getStrengthColor() : "bg-[#E2E8F0] dark:bg-[#334155]"
            }`}
          />
        ))}
      </div>

      <div className="space-y-1.5 pt-1">
        {requirements.map((req, idx) => (
          <div key={idx} className="flex items-center space-x-2 text-xs">
            {req.valid ? (
              <Check className="w-3.5 h-3.5 text-[#10B981] dark:text-[#6EE7B7] shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-[#94A3B8] dark:text-[#64748B] shrink-0" />
            )}
            <span className={req.valid ? "text-[#0F172A] dark:text-[#F8FAFC] font-medium" : "text-[#64748B] dark:text-[#94A3B8]"}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
