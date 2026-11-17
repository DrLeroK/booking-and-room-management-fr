"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/lib/store/authStore";
import { EyeIcon, EyeSlashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated, user, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectMap: Record<string, string> = {
        ADMIN: "/owner",
        OWNER: "/owner",
        MANAGER: "/manager",
        RECEPTIONIST: "/reception",
      };
      router.push(redirectMap[user.role] || "/reception");
    }
  }, [isAuthenticated, user, router]);

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    clearError();
    setAttemptCount(prev => prev + 1);
    
    const result = await login(data.username, data.password);
    
    if (result.success) {
      toast.success("Login successful!");
      setAttemptCount(0);
    } else {
      const msg = result.error || "Invalid username or password. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
      reset({ username: data.username, password: "" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4">
            <span className="text-4xl">🏨</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">StayCraft Hotel</h2>
          <p className="mt-2 text-sm text-gray-600">Management System Login</p>
        </div>

        <div className="card p-8">
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
                {attemptCount >= 2 && (
                  <p className="text-xs text-red-500 mt-1">
                    Try the demo credentials below.
                  </p>
                )}
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  {...register("username")}
                  id="username"
                  type="text"
                  autoComplete="username"
                  className={`input-field ${errors.username ? 'border-red-500' : ''}`}
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-blue-600 hover:text-blue-500 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="btn-primary w-full flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>

            {attemptCount > 0 && (
              <p className="text-xs text-gray-400 text-center">
                Attempt {attemptCount} {attemptCount >= 3 ? '⚠️' : ''}
              </p>
            )}
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-500 text-center mb-2">🎯 Demo Credentials (Click to auto-fill)</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => reset({ username: "manager", password: "Manager@StayCraft2026!" })}
                className="bg-white p-2 rounded border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-colors"
              >
                <span className="text-blue-600 font-semibold block">Manager</span>
                <div className="truncate">
                  <span className="font-mono text-gray-700">manager</span>
                  <span className="text-gray-400 mx-1">/</span>
                  <span className="font-mono text-gray-500 text-[10px]">Manager@...</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => reset({ username: "receptionist1", password: "Reception@StayCraft2026!" })}
                className="bg-white p-2 rounded border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-colors"
              >
                <span className="text-emerald-600 font-semibold block">Receptionist</span>
                <div className="truncate">
                  <span className="font-mono text-gray-700">receptionist1</span>
                  <span className="text-gray-400 mx-1">/</span>
                  <span className="font-mono text-gray-500 text-[10px]">Reception@...</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => reset({ username: "owner", password: "Owner@StayCraft2026!" })}
                className="bg-white p-2 rounded border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-colors"
              >
                <span className="text-purple-600 font-semibold block">Owner</span>
                <div className="truncate">
                  <span className="font-mono text-gray-700">owner</span>
                  <span className="text-gray-400 mx-1">/</span>
                  <span className="font-mono text-gray-500 text-[10px]">Owner@...</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => reset({ username: "admin", password: "Admin@StayCraft2026!" })}
                className="bg-white p-2 rounded border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-colors"
              >
                <span className="text-rose-600 font-semibold block">Admin</span>
                <div className="truncate">
                  <span className="font-mono text-gray-700">admin</span>
                  <span className="text-gray-400 mx-1">/</span>
                  <span className="font-mono text-gray-500 text-[10px]">Admin@...</span>
                </div>
              </button>
            </div>
          </div>



        </div>
      </div>
    </div>
  );
}

export default LoginPage;