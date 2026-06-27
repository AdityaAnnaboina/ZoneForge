import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-lg shadow-sm gap-4">
      {/* Showing X-Y of Z results */}
      <div className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{from}</span> to{" "}
        <span className="font-medium text-slate-700">{to}</span> of{" "}
        <span className="font-medium text-slate-700">{total}</span> results
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center space-x-3 text-sm">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 bg-white hover:bg-slate-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Prev
        </button>

        <span className="text-slate-600">
          Page <span className="font-medium text-slate-800">{page}</span> of{" "}
          <span className="font-medium text-slate-800">{totalPages || 1}</span>
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || totalPages === 0}
          className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 bg-white hover:bg-slate-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
