import React from "react";
import { cn } from "../../lib/cn";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    return (
      <div className="flex items-center space-x-2.5">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={cn(
            "w-4 h-4 text-[#2563EB] bg-white border-[#E2E8F0] rounded focus:ring-[#2563EB] focus:ring-2 cursor-pointer transition-colors duration-150",
            className
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-sm font-medium text-[#0F172A] cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
