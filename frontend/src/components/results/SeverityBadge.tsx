"use client";

import React from "react";
import type { Severity } from "@/lib/types";
import Badge from "@/components/ui/Badge";

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

const labels: Record<Severity, string> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
  info: "INFO",
};

export default function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <Badge variant={severity} dot className={className}>
      {labels[severity]}
    </Badge>
  );
}
