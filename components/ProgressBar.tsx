"use client";

interface ProgressBarProps {
  value: number; // 0-100
  color?: "brand" | "green" | "red" | "blue" | "orange";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  showLabel?: boolean;
}

export default function ProgressBar({
  value,
  color = "brand",
  size = "md",
  animated = false,
  showLabel = false,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const heights = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3.5",
  };

  const gradients = {
    brand: "from-brand-400 to-brand-600",
    green: "from-emerald-400 to-green-500",
    red: "from-red-400 to-rose-500",
    blue: "from-blue-400 to-indigo-500",
    orange: "from-orange-400 to-amber-500",
  };

  const tracks = {
    brand: "bg-brand-100",
    green: "bg-emerald-100",
    red: "bg-red-100",
    blue: "bg-blue-100",
    orange: "bg-orange-100",
  };

  return (
    <div className="w-full space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs text-dark-400">
          <span>Progress</span>
          <span className="font-medium text-dark-200">{clampedValue}%</span>
        </div>
      )}
      <div className={`w-full ${heights[size]} rounded-full ${tracks[color]} overflow-hidden`}>
        <div
          className={`${heights[size]} rounded-full bg-gradient-to-r ${gradients[color]} transition-all duration-700 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
