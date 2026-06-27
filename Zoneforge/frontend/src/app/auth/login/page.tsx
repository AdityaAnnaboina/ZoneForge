"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Globe, ShieldAlert } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginStore = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [justRegistered, setJustRegistered] = useState<boolean>(false);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setJustRegistered(true);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setJustRegistered(false);
    try {
      // API expects urlencoded OAuth2 format (username/password)
      const params = new URLSearchParams();
      params.append("username", data.email);
      params.append("password", data.password);

      const loginRes = await api.post("/api/auth/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const { access_token } = loginRes.data;

      // Fetch user profile info
      const profileRes = await api.get("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      // Login in Zustand store
      loginStore.login(access_token, profileRes.data);
      router.push("/dashboard");
    } catch (err) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      if (axiosError.response?.data?.detail) {
        setError(axiosError.response.data.detail);
      } else {
        setError("Invalid email or password. Please try again.");
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 shadow-lg shadow-orange-500/20">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">
            AWS Route 53 Console
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to manage your domains and DNS configurations
          </p>
        </div>

        {justRegistered && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
            Registration successful! Please sign in with your credentials.
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-white placeholder-slate-500 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 sm:text-sm"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-white placeholder-slate-500 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 sm:text-sm"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-semibold text-orange-500 hover:text-orange-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
          <p className="text-sm font-medium">Loading login console...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
