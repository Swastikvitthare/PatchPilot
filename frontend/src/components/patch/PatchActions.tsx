"use client";

import React from "react";
import { Wrench, RotateCcw, Download } from "lucide-react";
import Button from "@/components/ui/Button";

interface PatchActionsProps {
  onApplyPatch?: () => void;
  onRescan?: () => void;
  onDownloadReport?: () => void;
  isRescanning?: boolean;
  isDownloading?: boolean;
}

export default function PatchActions({
  onApplyPatch,
  onRescan,
  onDownloadReport,
  isRescanning = false,
  isDownloading = false,
}: PatchActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {onApplyPatch && (
        <Button
          variant="success"
          icon={<Wrench className="w-4 h-4" />}
          onClick={onApplyPatch}
        >
          Apply Patch
        </Button>
      )}
      {onRescan && (
        <Button
          variant="outline"
          icon={<RotateCcw className="w-4 h-4" />}
          onClick={onRescan}
          loading={isRescanning}
        >
          Re-scan Patched Code
        </Button>
      )}
      {onDownloadReport && (
        <Button
          variant="ghost"
          icon={<Download className="w-4 h-4" />}
          onClick={onDownloadReport}
          loading={isDownloading}
        >
          Download Report
        </Button>
      )}
    </div>
  );
}
