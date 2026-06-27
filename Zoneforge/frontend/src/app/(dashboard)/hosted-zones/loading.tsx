"use client";

import React from "react";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

export default function HostedZonesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-36 bg-slate-200 rounded animate-pulse"></div>
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
        <div className="h-10 w-40 bg-slate-200 rounded animate-pulse"></div>
      </div>
      <LoadingSkeleton rows={5} columns={7} />
    </div>
  );
}
