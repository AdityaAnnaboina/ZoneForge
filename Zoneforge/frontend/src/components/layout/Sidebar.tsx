"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  HeartPulse,
  GitBranch,
  Network,
  Settings,
} from "lucide-react";
import { useLayoutStore } from "@/store/layoutStore";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Hosted Zones", icon: Globe, href: "/hosted-zones" },
  { label: "Health Checks", icon: HeartPulse, href: "/health-checks" },
  { label: "Traffic Policies", icon: GitBranch, href: "/traffic-policies" },
  { label: "Resolver", icon: Network, href: "/resolver" },
  { label: "Profiles", icon: Settings, href: "/profiles" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarExpanded, setSidebarExpanded } = useLayoutStore();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarExpanded(false);
      } else {
        setSidebarExpanded(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarExpanded]);

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[#0f1923] text-gray-300 flex flex-col justify-between border-r border-slate-800/20 z-30 transition-all duration-300 ${
        isSidebarExpanded ? "w-[240px]" : "w-[60px]"
      }`}
    >
      {/* Top Logo Section */}
      <div>
        <div className="h-14 flex items-center px-4 border-b border-slate-800 bg-[#16222f]/20 overflow-hidden">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Globe className="h-5 w-5 text-[#FF9900] flex-shrink-0" />
            {isSidebarExpanded && (
              <span className="text-[#FF9900] font-bold text-base tracking-tight whitespace-nowrap">
                ZoneForge
              </span>
            )}
          </div>
        </div>

        {/* Navigation items */}
        <nav className="mt-4 flex-1">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard" || pathname.startsWith("/dashboard/")
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    title={!isSidebarExpanded ? item.label : undefined}
                    className={`flex items-center py-2.5 text-sm transition-all duration-150 ease ${
                      isSidebarExpanded ? "px-4" : "justify-center px-0"
                    } ${
                      isActive
                        ? "bg-[#1a2a3a] text-white border-l-2 border-[#FF9900] font-medium"
                        : "text-gray-300 hover:bg-[#1a2a3a] hover:text-white cursor-pointer"
                    }`}
                  >
                    <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${isSidebarExpanded ? "mr-3" : "mr-0"}`} />
                    {isSidebarExpanded && <span className="whitespace-nowrap">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className={`py-4 border-t border-slate-800 bg-[#16222f]/10 ${isSidebarExpanded ? "px-6" : "text-center px-0"}`}>
        {isSidebarExpanded ? (
          <span className="text-slate-500 text-xs font-mono">v1.0.0</span>
        ) : (
          <span className="text-slate-500 text-[10px] font-mono">v1.0</span>
        )}
      </div>
    </aside>
  );
}
