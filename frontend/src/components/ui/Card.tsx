"use client";

import React from "react";
import clsx from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export default function Card({
  children,
  className,
  glow = false,
  padding = "md",
  hover = false,
}: CardProps) {
  return (
    <div
      className={clsx(
        "bg-gray-900 border border-gray-800 rounded-xl",
        paddingStyles[padding],
        glow && "glow-cyan",
        hover &&
          "transition-all duration-300 hover:border-gray-700 hover:shadow-lg hover:shadow-cyan-950/20",
        className
      )}
    >
      {children}
    </div>
  );
}
