"use client";

import React from "react";
import clsx from "clsx";

type BadgeVariant =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "info"
  | "cyan"
  | "emerald"
  | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  critical:
    "bg-red-500/15 text-red-400 border-red-500/30 ring-red-500/20",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30 ring-orange-500/20",
  medium:
    "bg-yellow-500/15 text-yellow-400 border-yellow-500/30 ring-yellow-500/20",
  low: "bg-blue-500/15 text-blue-400 border-blue-500/30 ring-blue-500/20",
  info: "bg-gray-500/15 text-gray-400 border-gray-500/30 ring-gray-500/20",
  cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30 ring-cyan-500/20",
  emerald:
    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 ring-emerald-500/20",
  default:
    "bg-gray-500/15 text-gray-400 border-gray-600/30 ring-gray-500/20",
};

const dotColors: Record<BadgeVariant, string> = {
  critical: "bg-red-400",
  high: "bg-orange-400",
  medium: "bg-yellow-400",
  low: "bg-blue-400",
  info: "bg-gray-400",
  cyan: "bg-cyan-400",
  emerald: "bg-emerald-400",
  default: "bg-gray-400",
};

export default function Badge({
  variant = "default",
  children,
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={clsx("w-1.5 h-1.5 rounded-full", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}
