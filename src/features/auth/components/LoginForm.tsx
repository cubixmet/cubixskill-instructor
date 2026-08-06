import React from "react";
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
import { AuthFeedback } from "./AuthFeedback";
import { useAuth } from "../hooks/useAuth";

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { error: storeError, clearError } = useAuth();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
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
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate("/dashboard", { replace: true });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
      <AuthFeedback error={storeError} onClearError={clearError} />

      <Input
        label="Email address"
        type="email"
        placeholder="instructor@example.com"
        autoComplete="email"
        leftIcon={<Mail className="w-4 h-4" />}
        error={errors.email?.message}
        {...register("email")}
      />

      <PasswordField
        label="Password"
        placeholder="••••••••"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="flex items-center justify-between pt-1">
        <Checkbox
          label={<span className="text-xs sm:text-sm text-[#0F172A]">Remember Me</span>}
          {...register("remember_me")}
        />

        <Link
          to="/forgot-password"
          className="text-xs sm:text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
        >
          Forgot Password?
        </Link>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full mt-2"
        isLoading={loginMutation.isPending}
      >
        Sign In to Instructor Panel
      </Button>
    </form>
  );
};
