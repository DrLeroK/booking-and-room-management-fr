"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { resetPasswordSchema, ResetPasswordInput } from "@/features/auth/schemas";
import { authFeatureApi } from "@/features/auth/api";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      uid,
      token,
      new_password: "",
      new_password_confirm: "",
    },
  });

  const currentPassword = watch("new_password") || "";

  const rules = [
    { label: "At least 8 characters", test: currentPassword.length >= 8 },
    { label: "At least 1 uppercase letter (A-Z)", test: /[A-Z]/.test(currentPassword) },
    { label: "At least 1 lowercase letter (a-z)", test: /[a-z]/.test(currentPassword) },
    { label: "At least 1 number (0-9)", test: /\d/.test(currentPassword) },
    { label: "At least 1 special character (!@#$%^&*)", test: /[!@#$%^&*(),.?":{}|<>\-_+=\[\]\\/~`]/.test(currentPassword) },
  ];

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      await authFeatureApi.confirmPasswordReset({
        uid: data.uid || uid,
        token: data.token || token,
        new_password: data.new_password,
        new_password_confirm: data.new_password_confirm,
      });
      setIsSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string; message?: string } } };
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "The password reset token is invalid, expired, or has already been used.";
      toast.error(msg);
    }
  };

  if (!uid || !token) {
    return (
      <div className="card p-8 bg-white shadow-xl rounded-2xl border border-red-100 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 text-red-600">
          <ExclamationCircleIcon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Invalid Reset Link</h3>
        <p className="text-sm text-gray-600">
          This password reset link is invalid or malformed. Please request a new link from the forgot password page.
        </p>
        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-500"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="card p-8 bg-white shadow-xl rounded-2xl border border-green-100 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600">
          <CheckCircleIcon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Password Reset Complete!</h3>
        <p className="text-sm text-gray-600">
          Your password has been securely updated. You will be redirected to the sign-in page in a few seconds...
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-500"
          >
            Go to Sign In Now <ArrowLeftIcon className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-8 bg-white shadow-xl rounded-2xl border border-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <input type="hidden" {...register("uid")} value={uid} />
        <input type="hidden" {...register("token")} value={token} />

        <div>
          <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <div className="mt-1 relative">
            <input
              {...register("new_password")}
              id="new_password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Enter strong password"
              className={`input-field pr-10 w-full rounded-lg border py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                errors.new_password ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          {errors.new_password && (
            <p className="mt-1 text-sm text-red-600">{errors.new_password.message}</p>
          )}
        </div>

        {/* Real-time Password Strength Criteria */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 border border-gray-200">
          <p className="text-xs font-semibold text-gray-700">Password Requirements:</p>
          <ul className="space-y-1 text-xs">
            {rules.map((rule, idx) => (
              <li
                key={idx}
                className={`flex items-center gap-2 transition-colors ${
                  rule.test ? "text-green-600 font-medium" : "text-gray-500"
                }`}
              >
                {rule.test ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircleIcon className="w-4 h-4 text-gray-300 flex-shrink-0" />
                )}
                <span>{rule.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label htmlFor="new_password_confirm" className="block text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <div className="mt-1 relative">
            <input
              {...register("new_password_confirm")}
              id="new_password_confirm"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirm new password"
              className={`input-field pr-10 w-full rounded-lg border py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                errors.new_password_confirm ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          {errors.new_password_confirm && (
            <p className="mt-1 text-sm text-red-600">{errors.new_password_confirm.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Updating password...
            </>
          ) : (
            "Set New Password"
          )}
        </button>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Cancel and Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4">
            <span className="text-4xl">🔑</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Set New Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please choose a secure, strong password for your account
          </p>
        </div>

        <Suspense fallback={<div className="text-center p-8 text-gray-500">Loading form...</div>}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
