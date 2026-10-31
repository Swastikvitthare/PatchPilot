"use client";

import React from "react";
import { ScanSearch, Loader2, CheckCircle2, XCircle } from "lucide-react";
import clsx from "clsx";
import type { ScanStatus } from "@/lib/types";

interface ScanButtonProps {
  status: ScanStatus;
  onClick: () => void;
  disabled?: boolean;
}

export default function ScanButton({
  status,
  onClick,
  disabled,
}: ScanButtonProps) {
  const config = {
    idle: {
      icon: <ScanSearch className="w-5 h-5" />,
      label: "Scan Code",
      className:
        "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/30 hover:shadow-cyan-800/40 border-cyan-500/30",
    },
    scanning: {
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
      label: "Scanning...",
      className:
        "bg-cyan-600/80 text-white border-cyan-500/30 animate-pulse-glow cursor-wait",
    },
    complete: {
      icon: <CheckCircle2 className="w-5 h-5" />,
      label: "Scan Complete",
      className:
        "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 border-emerald-500/30",
    },
    error: {
      icon: <XCircle className="w-5 h-5" />,
      label: "Retry Scan",
      className:
        "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30 border-red-500/30",
    },
  };

  const current = config[status];

  return (
    <button
      onClick={onClick}
      disabled={disabled || status === "scanning"}
      className={clsx(
        "inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed",
        current.className
      )}
    >
      {current.icon}
      {current.label}
    </button>
  );
}
