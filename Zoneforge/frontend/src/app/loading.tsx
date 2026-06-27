"use client";

import React from "react";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-[#0f1923]">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FF9900] border-t-transparent"></div>
        <span className="text-sm font-medium text-slate-300">Loading ZoneForge Console...</span>
      </div>
    </div>
  );
}
