"use client";

import { useState, useCallback } from "react";
import {
  ScanResult,
  PatchResult,
  Vulnerability,
  ScanStatus,
  PatchStatus,
} from "@/lib/types";
import {
  scanCode,
  generatePatches,
  rescanCode,
  generateReport,
  downloadBlob,
} from "@/lib/api";

interface UseScannerReturn {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  filename: string;
  setFilename: (name: string) => void;
  scanResult: ScanResult | null;
  setScanResult: (result: ScanResult | null) => void;
  patchResult: PatchResult | null;
  setPatchResult: (result: PatchResult | null) => void;
  rescanResult: ScanResult | null;
  scanStatus: ScanStatus;
  patchStatus: PatchStatus;
  error: string | null;
  scan: () => Promise<ScanResult | null>;
  patch: (vulnerabilities?: Vulnerability[]) => Promise<PatchResult | null>;
  rescan: (patchedCode: string) => Promise<ScanResult | null>;
  downloadReport: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export function useScanner(): UseScannerReturn {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [filename, setFilename] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [patchResult, setPatchResult] = useState<PatchResult | null>(null);
  const [rescanResult, setRescanResult] = useState<ScanResult | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [patchStatus, setPatchStatus] = useState<PatchStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const scan = useCallback(async (): Promise<ScanResult | null> => {
    if (!code.trim()) {
      setError("Please enter some code to scan.");
      return null;
    }
    setScanStatus("scanning");
    setError(null);
    setScanResult(null);
    setPatchResult(null);
    setRescanResult(null);

    try {
      const result = await scanCode(code, language, filename || undefined);
      setScanResult(result);
      setScanStatus("complete");

      // Store in sessionStorage
      sessionStorage.setItem(
        `scan_${result.scan_id}`,
        JSON.stringify({
          scanResult: result,
          code,
          language,
          timestamp: new Date().toISOString(),
        })
      );

      // Store in recent scans list
      const recentScans = JSON.parse(
        sessionStorage.getItem("recent_scans") || "[]"
      );
      recentScans.unshift({
        scan_id: result.scan_id,
        filename: filename || "untitled",
        language,
        total_vulns: result.summary.total,
        critical: result.summary.critical,
        high: result.summary.high,
        scanned_at: result.scanned_at,
      });
      sessionStorage.setItem(
        "recent_scans",
        JSON.stringify(recentScans.slice(0, 20))
      );

      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Scan failed. Please try again.";
      setError(message);
      setScanStatus("error");
      return null;
    }
  }, [code, language, filename]);

  const patch = useCallback(
    async (
      vulnerabilities?: Vulnerability[]
    ): Promise<PatchResult | null> => {
      if (!scanResult) {
        setError("No scan results available. Please scan first.");
        return null;
      }
      setPatchStatus("patching");
      setError(null);

      const vulns = vulnerabilities || scanResult.vulnerabilities;

      try {
        const result = await generatePatches(code, vulns, scanResult.scan_id);
        setPatchResult(result);
        setPatchStatus("complete");

        // Store patch result
        sessionStorage.setItem(
          `patch_${scanResult.scan_id}`,
          JSON.stringify({
            patchResult: result,
            scanResult,
            originalCode: code,
            timestamp: new Date().toISOString(),
          })
        );

        return result;
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Patch generation failed. Please try again.";
        setError(message);
        setPatchStatus("error");
        return null;
      }
    },
    [code, scanResult]
  );

  const rescan = useCallback(
    async (patchedCode: string): Promise<ScanResult | null> => {
      setError(null);
      try {
        const result = await rescanCode(patchedCode, language);
        setRescanResult(result);
        return result;
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Re-scan failed. Please try again.";
        setError(message);
        return null;
      }
    },
    [language]
  );

  const downloadReportFn = useCallback(async (): Promise<void> => {
    if (!scanResult) {
      setError("No scan results available.");
      return;
    }
    setError(null);
    try {
      const blob = await generateReport({
        scan_id: scanResult.scan_id,
        original_code: code,
        patched_code: patchResult?.patched_code,
        vulnerabilities: scanResult.vulnerabilities,
        patches: patchResult?.patches,
      });
      downloadBlob(
        blob,
        `patchpilot-report-${scanResult.scan_id.slice(0, 8)}.pdf`
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Report download failed. Please try again.";
      setError(message);
    }
  }, [code, scanResult, patchResult]);

  const reset = useCallback(() => {
    setCode("");
    setLanguage("python");
    setFilename("");
    setScanResult(null);
    setPatchResult(null);
    setRescanResult(null);
    setScanStatus("idle");
    setPatchStatus("idle");
    setError(null);
  }, []);

  return {
    code,
    setCode,
    language,
    setLanguage,
    filename,
    setFilename,
    scanResult,
    setScanResult,
    patchResult,
    setPatchResult,
    rescanResult,
    scanStatus,
    patchStatus,
    error,
    scan,
    patch,
    rescan,
    downloadReport: downloadReportFn,
    clearError,
    reset,
  };
}
