import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
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
    <form onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-4 text-left">
      <ApiErrorAlert message={globalError || storeError} onClose={() => { setGlobalError(null); clearError(); }} />

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

      <div data-field-name="password">
        <PasswordField
          label="Password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
      </div>

      <div className="flex flex-col gap-3 min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between pt-1">
        <Checkbox
          label={<span className="text-xs sm:text-sm text-[#0F172A] dark:text-[#CBD5E1]">Remember Me</span>}
          {...register("remember_me")}
        />

        <Link
          to="/forgot-password"
          className="text-xs sm:text-sm font-medium text-[#2563EB] dark:text-[#60A5FA] hover:underline transition-colors"
        >
          Forgot Password?
        </Link>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full mt-2"
        isLoading={loginMutation.isPending || isSubmitting}
        disabled={loginMutation.isPending || isSubmitting}
        loadingText="Signing In..."
      >
        Sign In
      </Button>
    </form>
  );
};
