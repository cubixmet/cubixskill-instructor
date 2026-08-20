import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, KeyRound } from "lucide-react";
import { changePasswordSchema, type ChangePasswordSchemaType } from "../schemas/auth.schema";
import { useChangePassword } from "../hooks/useChangePassword";
import { PasswordField } from "./PasswordField";
import { PasswordStrength } from "./PasswordStrength";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";
import { ApiErrorAlert } from "../../../components/ui/ApiErrorAlert";
import { useFormScrollAndErrorMap } from "../../../hooks/useFormScrollAndErrorMap";

export const ChangePasswordForm: React.FC = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const { mapApiErrorsToForm, scrollToFirstError } = useFormScrollAndErrorMap<ChangePasswordSchemaType>();

  const changePasswordMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const watchNewPassword = watch("new_password");

  const onSubmit = (data: ChangePasswordSchemaType) => {
    setGlobalError(null);
    setSuccessMessage(null);

    changePasswordMutation.mutate(data, {
      onSuccess: (res) => {
        setSuccessMessage(res.message || "Password changed successfully.");
        reset();
      },
      onError: (err) => {
        const parsed = mapApiErrorsToForm(err, setError);
        if (!parsed.fieldErrors || Object.keys(parsed.fieldErrors).length === 0) {
          setGlobalError(parsed.message);
        }
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, () => scrollToFirstError())} className="space-y-4 text-left max-w-lg">
      {successMessage && (
        <Alert type="success" onClose={() => setSuccessMessage(null)}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] dark:text-[#6EE7B7] shrink-0" />
            <span>{successMessage}</span>
          </div>
        </Alert>
      )}

      <ApiErrorAlert message={globalError} onClose={() => setGlobalError(null)} />

      <div data-field-name="current_password">
        <PasswordField
          label="Current Password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.current_password?.message}
          aria-invalid={Boolean(errors.current_password)}
          {...register("current_password")}
        />
      </div>

      <div data-field-name="new_password">
        <PasswordField
          label="New Password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.new_password?.message}
          aria-invalid={Boolean(errors.new_password)}
          {...register("new_password")}
        />
      </div>

      <PasswordStrength password={watchNewPassword} />

      <div data-field-name="confirm_password">
        <PasswordField
          label="Confirm New Password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirm_password?.message}
          aria-invalid={Boolean(errors.confirm_password)}
          {...register("confirm_password")}
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto"
          isLoading={changePasswordMutation.isPending || isSubmitting}
          disabled={changePasswordMutation.isPending || isSubmitting}
          leftIcon={<KeyRound className="w-4 h-4" />}
        >
          Update Password
        </Button>
      </div>
    </form>
  );
};
