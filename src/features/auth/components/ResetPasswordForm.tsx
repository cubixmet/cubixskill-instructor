import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordSchemaType } from "../schemas/auth.schema";
import { useResetPassword } from "../hooks/useResetPassword";
import { PasswordField } from "./PasswordField";
import { PasswordStrength } from "./PasswordStrength";
import { Button } from "../../../components/ui/Button";
import { ApiErrorAlert } from "../../../components/ui/ApiErrorAlert";
import { useFormScrollAndErrorMap } from "../../../hooks/useFormScrollAndErrorMap";

export const ResetPasswordForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [isSuccess, setIsSuccess] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const resetPasswordMutation = useResetPassword();
  const { mapApiErrorsToForm, scrollToFirstError } = useFormScrollAndErrorMap<ResetPasswordSchemaType>();

  const {
    register,
    handleSubmit,
    watch,
    setError,
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
        onSuccess: () => {
          setIsSuccess(true);
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

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-14 h-14 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto text-[#16A34A] border border-[#86EFAC]">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#0F172A]">Password Reset Complete</h2>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
        </div>

        <Link to="/login" className="block pt-2">
          <Button size="lg" className="w-full">
            Proceed to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, () => scrollToFirstError())} className="space-y-4 text-left">
      <ApiErrorAlert message={globalError} onClose={() => setGlobalError(null)} />

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

      <Button
        type="submit"
        size="lg"
        className="w-full mt-2"
        isLoading={resetPasswordMutation.isPending || isSubmitting}
        disabled={resetPasswordMutation.isPending || isSubmitting}
      >
        Reset Password
      </Button>

      <div className="text-center pt-2">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </form>
  );
};
