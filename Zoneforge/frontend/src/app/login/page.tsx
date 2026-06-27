"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Globe, Eye, EyeOff, XCircle, Loader2, Lock } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchemaType) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      await login(data.username, data.password);
      router.push("/hosted-zones");
    } catch (err) {
      const errorMsg = (err as { message?: string }).message || "Invalid username or password";
      setLoginError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#0f1923] px-4 py-12 sm:px-6 lg:px-8">
      {/* Subtle grid pattern background using CSS */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "20px 20px"
        }}
      ></div>

      <div className="w-full max-w-md z-10">
        <div className="rounded-lg bg-white p-8 shadow-2xl border border-slate-100">
          {/* Logo placeholder */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 mb-4 shadow-sm">
              <Globe className="h-6 w-6 text-[#FF9900]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Sign in to ZoneForge
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Your DNS Management Console
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Error Alert */}
            {loginError && (
              <div className="flex items-start rounded-md border border-red-300 bg-red-50 p-3 text-red-700 text-sm">
                <XCircle className="h-5 w-5 mr-2.5 flex-shrink-0 text-red-500" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Username Input */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  {...register("username")}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter username"
                  disabled={isLoading}
                />
                {errors.username && (
                  <span className="text-xs text-red-600">
                    {errors.username.message}
                  </span>
                )}
              </div>

              {/* Password Input */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm text-gray-900 bg-white shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-xs text-red-600">
                    {errors.password.message}
                  </span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-md bg-[#FF9900] py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-[#e8890a] focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 border-t border-slate-100 pt-6 flex items-center justify-center space-x-1.5 text-xs text-gray-500">
            <Lock className="h-3.5 w-3.5" />
            <span>Default credentials: admin / admin123</span>
          </div>
        </div>
      </div>
    </main>
  );
}
