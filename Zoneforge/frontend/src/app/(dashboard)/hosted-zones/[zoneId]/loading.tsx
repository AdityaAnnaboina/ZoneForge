"use client";

import React from "react";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

export default function ZoneDetailsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-48 bg-slate-200 rounded animate-pulse"></div>
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm h-28 animate-pulse"></div>
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
        <div className="h-10 w-40 bg-slate-200 rounded animate-pulse"></div>
      </div>
      <LoadingSkeleton rows={8} columns={8} />
    </div>
  );
}
