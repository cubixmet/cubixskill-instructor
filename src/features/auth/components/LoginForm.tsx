import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import { loginSchema, type LoginSchemaType } from "../schemas/auth.schema";
import { useLogin } from "../hooks/useLogin";
import { Input } from "../../../components/ui/Input";
import { Checkbox } from "../../../components/ui/Checkbox";
import { Button } from "../../../components/ui/Button";
import { PasswordField } from "./PasswordField";
import { ApiErrorAlert } from "../../../components/ui/ApiErrorAlert";
import { useAuth } from "../hooks/useAuth";
import { useFormScrollAndErrorMap } from "../../../hooks/useFormScrollAndErrorMap";

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { error: storeError, clearError } = useAuth();
  const loginMutation = useLogin();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const { mapApiErrorsToForm, scrollToFirstError } = useFormScrollAndErrorMap<LoginSchemaType>();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember_me: false,
    },
  });

  const onSubmit = (data: LoginSchemaType) => {
    clearError();
    setGlobalError(null);

    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate("/dashboard", { replace: true });
      },
      onError: (err) => {
        const parsed = mapApiErrorsToForm(err, setError);
        if (parsed.code === "INVALID_CREDENTIALS") {
          setError("email", { type: "server", message: "" });
          setError("password", { type: "server", message: "Email or password is incorrect. Please try again." });
          scrollToFirstError("email");
        } else if (parsed.code === "ACCOUNT_SETUP_PENDING") {
          setGlobalError(parsed.message);
          scrollToFirstError("email");
        } else if (!parsed.fieldErrors || Object.keys(parsed.fieldErrors).length === 0) {
          setGlobalError(parsed.message);
        }
      },
    });
  };

  const onInvalidSubmit = () => {
    scrollToFirstError();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-3.5 text-left">
      <ApiErrorAlert message={globalError || storeError} onClose={() => { setGlobalError(null); clearError(); }} />

      <div data-field-name="email">
        <Input
          type="email"
          placeholder="Email Address"
          autoComplete="email"
          leftIcon={<Mail className="w-4 h-4 text-[var(--text-muted)]" />}
          error={errors.email?.message}
          aria-invalid={Boolean(errors.email)}
          className="h-[52px] min-h-[52px] rounded-[12px] bg-[var(--surface-secondary)] border-[var(--input-border)] focus:border-[var(--brand-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm"
          {...register("email")}
        />
      </div>

      <div data-field-name="password">
        <PasswordField
          placeholder="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          aria-invalid={Boolean(errors.password)}
          className="h-[52px] min-h-[52px] rounded-[12px] bg-[var(--surface-secondary)] border-[var(--input-border)] focus:border-[var(--brand-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm"
          {...register("password")}
        />
      </div>

      <div className="flex items-center justify-between pt-0.5 text-xs sm:text-sm">
        <Checkbox
          label={<span className="text-xs sm:text-sm text-[var(--text-primary)] font-medium">Remember me</span>}
          {...register("remember_me")}
        />

        <Link
          to="/forgot-password"
          className="text-xs sm:text-sm font-semibold text-[var(--brand-primary)] hover:underline transition-colors shrink-0"
        >
          Forgot Password?
        </Link>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full h-[52px] rounded-[12px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-[var(--brand-primary-foreground)] font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs mt-1"
        isLoading={loginMutation.isPending || isSubmitting}
        disabled={loginMutation.isPending || isSubmitting}
        loadingText="Logging in..."
      >
        <span>Login</span>
        <ArrowRight className="w-4 h-4" />
      </Button>
    </form>
  );
};
