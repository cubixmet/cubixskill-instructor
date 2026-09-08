import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Mail, CheckCircle2, ArrowLeft, RefreshCw, ArrowRight } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordSchemaType } from "../schemas/auth.schema";
import { useForgotPassword } from "../hooks/useForgotPassword";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { ApiErrorAlert } from "../../../components/ui/ApiErrorAlert";
import { useFormScrollAndErrorMap } from "../../../hooks/useFormScrollAndErrorMap";

export const ForgotPasswordForm: React.FC = () => {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const forgotPasswordMutation = useForgotPassword();
  const { mapApiErrorsToForm, scrollToFirstError } = useFormScrollAndErrorMap<ForgotPasswordSchemaType>();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const isPending = forgotPasswordMutation.isPending || isSubmitting;

  const onSubmit = (data: ForgotPasswordSchemaType) => {
    if (isPending) return;
    setGlobalError(null);

    const trimmedEmail = data.email.trim();

    forgotPasswordMutation.mutate(
      { email: trimmedEmail },
      {
        onSuccess: () => {
          setSubmittedEmail(trimmedEmail);
        },
        onError: (err) => {
          const parsed = mapApiErrorsToForm(err, setError);
          if (!parsed.fieldErrors?.email) {
            setGlobalError(parsed.message || "We couldn't send the reset request right now. Please try again.");
          } else {
            setGlobalError(null);
          }
        },
      }
    );
  };

  const handleResend = () => {
    if (!submittedEmail || isPending) return;
    setGlobalError(null);

    forgotPasswordMutation.mutate(
      { email: submittedEmail.trim() },
      {
        onError: (err) => {
          const parsed = mapApiErrorsToForm(err, setError);
          if (!parsed.fieldErrors?.email) {
            setGlobalError(parsed.message || "We couldn't send the reset request right now. Please try again.");
          } else {
            setGlobalError(null);
          }
        },
      }
    );
  };

  if (submittedEmail) {
    return (
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 bg-[var(--surface-secondary)] rounded-full flex items-center justify-center mx-auto text-[var(--brand-primary)] border border-[var(--border)]">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Check your email</h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
            Password reset instructions have been sent to your email.
          </p>
        </div>

        <ApiErrorAlert message={globalError} onClose={() => setGlobalError(null)} />

        <div className="space-y-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full h-[52px] rounded-[12px] border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] font-semibold text-sm hover:bg-[var(--surface-hover)] transition-all cursor-pointer flex items-center justify-center gap-2"
            onClick={handleResend}
            isLoading={isPending}
            disabled={isPending}
            loadingText="Sending..."
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Resend Link
          </Button>

          <Link to="/login" className="block">
            <Button
              type="button"
              variant="ghost"
              size="md"
              className="w-full h-[46px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium transition-colors"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () => scrollToFirstError("email"))}
      noValidate
      className="space-y-3.5 text-left"
    >
      <ApiErrorAlert message={globalError} onClose={() => setGlobalError(null)} />

      <div data-field-name="email">
        <Input
          id="forgot-password-email"
          type="email"
          placeholder="Enter your email address"
          autoComplete="email"
          leftIcon={<Mail className="w-4 h-4 text-[var(--text-muted)]" />}
          error={errors.email?.message}
          aria-invalid={Boolean(errors.email)}
          className="h-[52px] min-h-[52px] rounded-[12px] bg-[var(--surface-secondary)] border-[var(--input-border)] focus:border-[var(--brand-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm"
          {...register("email", {
            onChange: () => {
              if (globalError) setGlobalError(null);
              if (errors.email) clearErrors("email");
            },
          })}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full h-[52px] rounded-[12px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-[var(--brand-primary-foreground)] font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs mt-1"
        isLoading={isPending}
        disabled={isPending}
        loadingText="Sending..."
      >
        <span>Send Reset Link</span>
        <ArrowRight className="w-4 h-4" />
      </Button>
    </form>
  );
};

