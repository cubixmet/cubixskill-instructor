import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { setupPasswordSchema, type SetupPasswordSchemaType } from "../schemas/auth.schema";
import { useSetupPassword } from "../hooks/useSetupPassword";
import { PasswordField } from "./PasswordField";
import { PasswordStrength } from "./PasswordStrength";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";
import { formatAuthError } from "../utils/auth-errors";
import { AUTH_MESSAGES } from "../constants/auth.constants";

export interface PasswordSetupFormProps {
  token: string;
}

export const PasswordSetupForm: React.FC<PasswordSetupFormProps> = ({ token }) => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const setupPasswordMutation = useSetupPassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SetupPasswordSchemaType>({
    resolver: zodResolver(setupPasswordSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  const passwordValue = watch("password");

  const onSubmit = (data: SetupPasswordSchemaType) => {
    setApiError(null);
    setupPasswordMutation.mutate(
      {
        token,
        password: data.password,
        confirm_password: data.confirm_password,
      },
      {
        onSuccess: () => {
          setSuccessMessage(AUTH_MESSAGES.PASSWORD_SET_SUCCESS);
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 2000);
        },
        onError: (err) => {
          setApiError(formatAuthError(err));
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
      {apiError && (
        <Alert type="error" onClose={() => setApiError(null)}>
          {apiError}
        </Alert>
      )}

      {successMessage && (
        <Alert type="success" title="Success">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            <span>{successMessage}</span>
          </div>
        </Alert>
      )}

      <PasswordField
        label="New Password"
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />

      <PasswordStrength password={passwordValue} />

      <PasswordField
        label="Confirm Password"
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.confirm_password?.message}
        {...register("confirm_password")}
      />

      <Button
        type="submit"
        size="lg"
        className="w-full mt-4"
        isLoading={setupPasswordMutation.isPending}
        disabled={Boolean(successMessage)}
      >
        Set New Password
      </Button>
    </form>
  );
};
