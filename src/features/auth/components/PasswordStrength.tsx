import React from "react";
import { Check, Shield } from "lucide-react";
import { passwordRequirementsRegex } from "../schemas/auth.schema";

export interface PasswordStrengthProps {
  password?: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password = "" }) => {
  const requirements = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One uppercase letter", valid: passwordRequirementsRegex.uppercase.test(password) },
    { label: "One lowercase letter", valid: passwordRequirementsRegex.lowercase.test(password) },
    { label: "One number", valid: passwordRequirementsRegex.number.test(password) },
  ];

  return (
    <div className="p-3.5 sm:p-4 rounded-[12px] bg-[var(--surface-secondary)] border border-[var(--border)] text-left space-y-2.5 transition-colors duration-200">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center shrink-0">
          <Shield className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-semibold text-[var(--text-primary)]">
          Password must include:
        </span>
      </div>

      <div className="space-y-1.5 pl-0.5">
        {requirements.map((req, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                req.valid
                  ? "bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)]"
                  : "bg-[var(--border)] text-[var(--text-muted)]"
              }`}
            >
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span
              className={`transition-colors ${
                req.valid
                  ? "text-[var(--text-primary)] font-medium"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

