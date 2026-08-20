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
      <div className="flex items-center space-x-2.5 shrink-0">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={cn(
            "w-4 h-4 rounded border cursor-pointer transition-colors duration-150 text-[#2563EB] bg-[#FFFFFF] dark:bg-[#0F172A] border-[#94A3B8] dark:border-[#64748B] checked:bg-[#2563EB] checked:border-[#2563EB] focus:ring-[#2563EB] focus:ring-2 focus:ring-offset-0 shrink-0",
            className
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-xs sm:text-sm font-medium text-[#0F172A] dark:text-[#CBD5E1] cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
