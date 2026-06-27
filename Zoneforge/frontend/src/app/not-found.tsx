"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#0f1923] px-4 text-center">
      {/* Subtle grid pattern background using CSS */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}
      ></div>

      <div className="z-10 max-w-md bg-white border border-slate-200 rounded-lg shadow-2xl p-8 flex flex-col items-center">
        {/* Large "404" in gray-200 */}
        <h1 className="text-8xl font-black text-slate-100 tracking-tight select-none mb-2">
          404
        </h1>

        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Page not found</h2>

        {/* Description */}
        <p className="text-slate-500 text-sm max-w-sm mb-6 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>

        {/* Action Button */}
        <Link
          href="/hosted-zones"
          className="inline-flex items-center justify-center w-full px-4 py-2.5 border border-transparent rounded-md text-sm font-medium text-black bg-[#FF9900] hover:bg-[#e8890a] shadow-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Hosted Zones
        </Link>
      </div>
    </main>
  );
}
