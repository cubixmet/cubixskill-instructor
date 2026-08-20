import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input, type InputProps } from "../../../components/ui/Input";

export type PasswordFieldProps = Omit<InputProps, "type" | "rightIcon">;

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  (props, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        leftIcon={<Lock className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="p-1 text-[#64748B] dark:text-[#94A3B8] hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors focus:outline-none cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordField.displayName = "PasswordField";
