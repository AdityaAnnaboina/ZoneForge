"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import NotificationContainer from "@/components/ui/Notification";

import ErrorBoundary from "@/components/ErrorBoundary";
import { useLayoutStore } from "@/store/layoutStore";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();
  const { isSidebarExpanded } = useLayoutStore();

  useEffect(() => {
    if (!token || !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, token, router]);

  if (!token || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      {/* Sidebar fixed left */}
      <Sidebar />

      {/* Main content wrapper */}
      <div className={`transition-all duration-300 ${isSidebarExpanded ? "ml-[240px]" : "ml-[60px]"}`}>
        {/* TopBar fixed top */}
        <TopBar />

        {/* Content area */}
        <main className="pt-14 min-h-[calc(100vh-56px)] bg-gray-50 px-6 py-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>

      {/* Global Notifications */}
      <NotificationContainer />
    </div>
  );
}
