import React from "react";

interface ConfirmInputProps {
  expectedValue: string;
  value: string;
  onChange: (val: string) => void;
  label: string;
}

export default function ConfirmInput({
  expectedValue,
  value,
  onChange,
  label,
}: ConfirmInputProps) {
  const isMatch = value === expectedValue;

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-slate-700">
        {label} (Type{" "}
        <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-red-600">
          {expectedValue}
        </span>{" "}
        to confirm)
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none transition-colors ${
          isMatch
            ? "border-green-500 bg-green-50/50 focus:ring-1 focus:ring-green-500 focus:border-green-500"
            : "border-slate-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
        }`}
        placeholder={`Type "${expectedValue}" to confirm`}
      />
    </div>
  );
}
