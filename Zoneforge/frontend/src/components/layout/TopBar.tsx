"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Globe, User, LogOut, Menu } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useLayoutStore } from "../../store/layoutStore";

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { isSidebarExpanded, toggleSidebar } = useLayoutStore();

  const getPageName = () => {
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return "Dashboard";
    if (pathname.startsWith("/hosted-zones")) return "Hosted Zones";
    if (pathname.startsWith("/health-checks")) return "Health Checks";
    if (pathname.startsWith("/traffic-policies")) return "Traffic Policies";
    if (pathname.startsWith("/resolver")) return "Resolver";
    if (pathname.startsWith("/profiles")) return "Profiles";
    return "";
  };

  const handleSignOut = () => {
    logout();
    router.push("/login");
  };

  const pageName = getPageName();

  return (
    <header
      className={`fixed top-0 right-0 h-14 bg-[#161e2d] border-b border-[#2d3748] flex items-center justify-between px-6 z-20 transition-all duration-300 ${
        isSidebarExpanded ? "left-[240px]" : "left-[60px]"
      }`}
    >
      {/* Left side: Menu Toggle + Amazon Route 53 > Page Name */}
      <div className="flex items-center space-x-4 text-sm">
        <button
          onClick={toggleSidebar}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors focus:outline-none"
          aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={isSidebarExpanded}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-white font-medium">ZoneForge Console</span>
          {pageName && (
            <>
              <span className="text-slate-500 font-normal">&gt;</span>
              <span className="text-gray-400">{pageName}</span>
            </>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Region Selector */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-400 border border-slate-700 bg-slate-900/50 px-2 py-1 rounded">
          <Globe className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">us-east-1 (Global)</span>
          <span className="sm:hidden">us-east-1</span>
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-slate-700"></div>

        {/* Username (Hides on mobile < 768px) */}
        <div className="hidden md:flex items-center space-x-2 text-sm text-white">
          <User className="h-4 w-4 text-slate-400" />
          <span className="font-medium">{user?.username || "Guest"}</span>
        </div>

        {/* Divider (Hides on mobile < 768px) */}
        <div className="hidden md:block h-4 w-px bg-slate-700"></div>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-1.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
