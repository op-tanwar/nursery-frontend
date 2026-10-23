"use client";

interface SpinnerProps {
  /** Size variants matching design layout grids */
  size?: "sm" | "md" | "lg" | "xl";
  /** Optional custom layout class overrides */
  className?: string;
}

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  // Strict size dimension tokens mapping
  const sizeClasses = {
    sm: "w-5 h-5 stroke-[3px]",
    md: "w-8 h-8 stroke-[2.5px]",
    lg: "w-12 h-12 stroke-[2px]",
    xl: "w-16 h-16 stroke-[2px]",
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      role="status"
      aria-label="Loading"
    >
      {/* Hardware accelerated native rotating SVG wheel */}
      <svg
        className={`animate-spin text-brand-primary ${sizeClasses[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        {/* Track Circle (Light faded base layout track) */}
        <circle
          className="opacity-15 stroke-foreground"
          cx="12"
          cy="12"
          r="10"
        />
        {/* Active Arch Indicator (Using Urban Nursery brand token colors) */}
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}