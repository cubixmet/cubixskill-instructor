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
import { ApiErrorAlert } from "../../../components/ui/ApiErrorAlert";
import { useFormScrollAndErrorMap } from "../../../hooks/useFormScrollAndErrorMap";
import { AUTH_MESSAGES } from "../constants/auth.constants";

import { authStore } from "../../../store/auth.store";

export interface PasswordSetupFormProps {
  token: string;
}

export const PasswordSetupForm: React.FC<PasswordSetupFormProps> = ({ token }) => {
  const navigate = useNavigate();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const setupPasswordMutation = useSetupPassword();
  const { mapApiErrorsToForm, scrollToFirstError } = useFormScrollAndErrorMap<SetupPasswordSchemaType>();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SetupPasswordSchemaType>({
    resolver: zodResolver(setupPasswordSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  const passwordValue = watch("password");

  const onSubmit = (data: SetupPasswordSchemaType) => {
    setGlobalError(null);
    setupPasswordMutation.mutate(
      {
        token,
        new_password: data.password,
        confirm_password: data.confirm_password,
      },
      {
        onSuccess: (resData) => {
          setSuccessMessage(AUTH_MESSAGES.PASSWORD_SET_SUCCESS);
          if (resData?.access && resData?.refresh && resData?.user) {
            authStore.setSession(resData.user, resData.access, resData.refresh);
            setTimeout(() => {
              navigate("/dashboard", { replace: true });
            }, 1000);
          } else {
            setTimeout(() => {
              navigate("/login", { replace: true });
            }, 1500);
          }
        },
        onError: (err) => {
          const parsed = mapApiErrorsToForm(err, (field, options) => {
            // Map backend new_password error to form password field
            const targetField = field === "new_password" ? "password" : field;
            setError(targetField as any, options);
          });
          if (!parsed.fieldErrors || Object.keys(parsed.fieldErrors).length === 0) {
            setGlobalError(parsed.message);
          }
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, () => scrollToFirstError())} className="space-y-4 text-left">
      <ApiErrorAlert message={globalError} onClose={() => setGlobalError(null)} />

      {successMessage && (
        <Alert type="success" title="Success">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            <span>{successMessage}</span>
          </div>
        </Alert>
      )}

      <div data-field-name="password">
        <PasswordField
          label="New Password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.password?.message}
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
      </div>

      <PasswordStrength password={passwordValue} />

      <div data-field-name="confirm_password">
        <PasswordField
          label="Confirm Password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirm_password?.message}
          aria-invalid={Boolean(errors.confirm_password)}
          {...register("confirm_password")}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full mt-4"
        isLoading={setupPasswordMutation.isPending || isSubmitting}
        disabled={setupPasswordMutation.isPending || isSubmitting || Boolean(successMessage)}
      >
        Set New Password
      </Button>
    </form>
  );
};

