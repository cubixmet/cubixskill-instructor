import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Mail, CheckCircle2, ArrowLeft, RefreshCw } from "lucide-react";
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
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordSchemaType) => {
    setGlobalError(null);
    forgotPasswordMutation.mutate(data, {
      onSuccess: () => {
        setSubmittedEmail(data.email);
      },
      onError: (err) => {
        const parsed = mapApiErrorsToForm(err, setError);
        if (!parsed.fieldErrors || Object.keys(parsed.fieldErrors).length === 0) {
          setGlobalError(parsed.message);
        }
      },
    });
  };

  const handleResend = () => {
    if (!submittedEmail) return;
    setGlobalError(null);
    forgotPasswordMutation.mutate(
      { email: submittedEmail },
      {
        onError: (err) => {
          const parsed = mapApiErrorsToForm(err, setError);
          if (!parsed.fieldErrors || Object.keys(parsed.fieldErrors).length === 0) {
            setGlobalError(parsed.message);
          }
        },
      }
    );
  };

  if (submittedEmail) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-14 h-14 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto text-[#16A34A] border border-[#86EFAC]">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#0F172A]">Check Your Email</h2>
          <p className="text-sm text-[#64748B] leading-relaxed">
            If an account exists for <span className="font-semibold text-[#0F172A]">{submittedEmail}</span>, password reset instructions have been sent.
          </p>
        </div>

        <ApiErrorAlert message={globalError} onClose={() => setGlobalError(null)} />

        <div className="space-y-3 pt-2">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleResend}
            isLoading={forgotPasswordMutation.isPending}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Resend Email
          </Button>

          <Link to="/login" className="block">
            <Button
              variant="ghost"
              size="md"
              className="w-full"
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
    <form onSubmit={handleSubmit(onSubmit, () => scrollToFirstError())} className="space-y-4 text-left">
      <ApiErrorAlert message={globalError} onClose={() => setGlobalError(null)} />

      <div data-field-name="email">
        <Input
          label="Email address"
          type="email"
          placeholder="admin@academy.com"
          autoComplete="email"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full mt-2"
        isLoading={forgotPasswordMutation.isPending || isSubmitting}
        disabled={forgotPasswordMutation.isPending || isSubmitting}
      >
        Send Password Reset Link
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
