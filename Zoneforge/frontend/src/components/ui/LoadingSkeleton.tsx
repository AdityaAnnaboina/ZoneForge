import React from "react";

interface LoadingSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function LoadingSkeleton({ rows = 5, columns = 4 }: LoadingSkeletonProps) {
  const rowArray = Array.from({ length: rows });
  const colArray = Array.from({ length: columns });

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {colArray.map((_, i) => (
              <th key={i} className="px-6 py-4">
                <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {rowArray.map((_, rIndex) => (
            <tr key={rIndex}>
              {colArray.map((_, cIndex) => (
                <td key={cIndex} className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-5/6"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
