import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordSchemaType } from "../schemas/auth.schema";
import { useResetPassword } from "../hooks/useResetPassword";
import { PasswordField } from "./PasswordField";
import { PasswordStrength } from "./PasswordStrength";
import { Button } from "../../../components/ui/Button";
import { ApiErrorAlert } from "../../../components/ui/ApiErrorAlert";
import { useFormScrollAndErrorMap } from "../../../hooks/useFormScrollAndErrorMap";
import { authStore } from "../../../store/auth.store";

export const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [globalError, setGlobalError] = useState<string | null>(null);

  const resetPasswordMutation = useResetPassword();
  const { mapApiErrorsToForm, scrollToFirstError } = useFormScrollAndErrorMap<ResetPasswordSchemaType>();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token,
      new_password: "",
      confirm_password: "",
    },
  });

  const watchNewPassword = watch("new_password");

  const onSubmit = (data: ResetPasswordSchemaType) => {
    setGlobalError(null);
    resetPasswordMutation.mutate(
      {
        token: token || data.token,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      },
      {
        onSuccess: (resData) => {
          if (resData?.access && resData?.refresh && resData?.user) {
            reset();
            authStore.setSession(resData.user, resData.access, resData.refresh);
            navigate("/dashboard", { replace: true });
          } else {
            setGlobalError("Failed to initialize session. Please log in.");
          }
        },
        onError: (err) => {
          const parsed = mapApiErrorsToForm(err, setError);
          if (!parsed.fieldErrors || Object.keys(parsed.fieldErrors).length === 0) {
            setGlobalError(parsed.message);
          }
        },
      }
    );
  };

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <ApiErrorAlert message="Missing or invalid password reset token. Please request a new password reset link." />
        <Link to="/forgot-password" className="block">
          <Button variant="outline" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Request New Link
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, () => scrollToFirstError())} className="space-y-3.5 text-left">
      <ApiErrorAlert message={globalError} onClose={() => setGlobalError(null)} />

      <div data-field-name="new_password">
        <PasswordField
          placeholder="New Password"
          autoComplete="new-password"
          error={errors.new_password?.message}
          aria-invalid={Boolean(errors.new_password)}
          className="h-[52px] min-h-[52px] rounded-[12px] bg-[var(--surface-secondary)] border-[var(--input-border)] focus:border-[var(--brand-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm"
          {...register("new_password")}
        />
      </div>

      <div data-field-name="confirm_password">
        <PasswordField
          placeholder="Confirm New Password"
          autoComplete="new-password"
          error={errors.confirm_password?.message}
          aria-invalid={Boolean(errors.confirm_password)}
          className="h-[52px] min-h-[52px] rounded-[12px] bg-[var(--surface-secondary)] border-[var(--input-border)] focus:border-[var(--brand-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm"
          {...register("confirm_password")}
        />
      </div>

      <PasswordStrength password={watchNewPassword} />

      <Button
        type="submit"
        size="lg"
        className="w-full h-[52px] rounded-[12px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-[var(--brand-primary-foreground)] font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs mt-2"
        isLoading={resetPasswordMutation.isPending || isSubmitting}
        disabled={resetPasswordMutation.isPending || isSubmitting}
        loadingText="Resetting..."
      >
        <span>Reset Password</span>
        <ArrowRight className="w-4 h-4" />
      </Button>
    </form>
  );
};

