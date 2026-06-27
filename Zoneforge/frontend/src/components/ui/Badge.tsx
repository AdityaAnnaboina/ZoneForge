import React from "react";

type BadgeVariant =
  | "Public"
  | "Private"
  | "A"
  | "AAAA"
  | "CNAME"
  | "TXT"
  | "MX"
  | "NS"
  | "PTR"
  | "SRV"
  | "CAA";

interface BadgeProps {
  variant: BadgeVariant | string;
  children?: React.ReactNode;
}

const colorMap: Record<string, string> = {
  Public: "bg-green-100 text-green-800",
  Private: "bg-purple-100 text-purple-800",
  A: "bg-blue-100 text-blue-800",
  AAAA: "bg-indigo-100 text-indigo-800",
  CNAME: "bg-yellow-100 text-yellow-800",
  TXT: "bg-gray-100 text-gray-800",
  MX: "bg-orange-100 text-orange-800",
  NS: "bg-red-100 text-red-800",
};

export default function Badge({ variant, children }: BadgeProps) {
  const classes = colorMap[variant] || "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}
    >
      {children || variant}
    </span>
  );
}
