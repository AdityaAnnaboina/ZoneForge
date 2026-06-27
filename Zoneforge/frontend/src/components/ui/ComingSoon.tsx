import React from "react";
import { LucideIcon } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function ComingSoon({ title, description, icon: Icon }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-lg shadow-sm p-8 flex flex-col items-center text-center">
        {/* Large icon in orange circle */}
        <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-6 shadow-inner">
          <Icon className="h-8 w-8" />
        </div>

        {/* Badge in orange */}
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200 mb-4 uppercase tracking-wide">
          Feature Coming Soon
        </span>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>

        {/* Description */}
        <p className="text-gray-500 text-sm max-w-md leading-relaxed mb-6">
          {description}
        </p>

        {/* Decorative footer */}
        <div className="w-full pt-6 border-t border-slate-100 text-xs text-slate-400">
          Amazon Route 53 Console &copy; 2026
        </div>
      </div>
    </div>
  );
}
