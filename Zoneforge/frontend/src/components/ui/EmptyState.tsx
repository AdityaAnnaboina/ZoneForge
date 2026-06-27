import React from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50 my-4">
      <Inbox className="h-12 w-12 text-slate-400 mb-3" />
      <h3 className="text-slate-700 text-lg font-medium mb-1">{title}</h3>
      <p className="text-slate-500 text-sm max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
