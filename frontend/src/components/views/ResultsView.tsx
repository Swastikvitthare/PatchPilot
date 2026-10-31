"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield, AlertTriangle, ChevronLeft, Download, Wrench,
  CheckCircle, XCircle, Info, Loader2,
} from "lucide-react";
import { ScanResult, Vulnerability } from "@/lib/types";
import VulnerabilityCard from "@/components/results/VulnerabilityCard";
import { generateReport } from "@/lib/api";

type SeverityFilter = "all" | "critical" | "high" | "medium" | "low" | "info";

export default function ResultsView() {
  const params = useParams();
  const router = useRouter();
  const scanId = (params?.id as string) || "latest";

  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [filter, setFilter] = useState<SeverityFilter>("all");
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`scan_${scanId}`);
    if (stored) {
      setScanResult(JSON.parse(stored));
    } else {
      setError("Scan results not found. Please run a scan first.");
    }
  }, [scanId]);

  const filtered: Vulnerability[] = scanResult
    ? filter === "all"
      ? scanResult.vulnerabilities
      : scanResult.vulnerabilities.filter((v) => v.severity === filter)
    : [];

  const handleGenerateAllPatches = () => {
    if (!scanResult) return;
    router.push(`/patch/${scanId}`);
  };

  const handleDownloadReport = async () => {
    if (!scanResult) return;
    setIsDownloading(true);
    try {
      const code = sessionStorage.getItem(`code_${scanId}`) || "";
      const blob = await generateReport({
        scan_id: scanId,
        original_code: code,
        vulnerabilities: scanResult.vulnerabilities,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `patchpilot-report-${scanId.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to generate report. Check that the backend is running.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (error && !scanResult) {
    return (
      <div className="min-h-screen flex items-center justify-center cyber-grid">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl text-white font-semibold mb-2">Results Not Found</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/scanner" className="px-6 py-3 bg-cyan-500 text-gray-950 font-bold rounded-lg">
            Start New Scan
          </Link>
        </div>
      </div>
    );
  }

  if (!scanResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const { summary } = scanResult;

  const filterTabs: { key: SeverityFilter; label: string; count: number; color: string }[] = [
    { key: "all", label: "All", count: summary.total, color: "text-white" },
    { key: "critical", label: "Critical", count: summary.critical, color: "text-red-400" },
    { key: "high", label: "High", count: summary.high, color: "text-orange-400" },
    { key: "medium", label: "Medium", count: summary.medium, color: "text-yellow-400" },
    { key: "low", label: "Low", count: summary.low, color: "text-blue-400" },
    { key: "info", label: "Info", count: summary.info, color: "text-gray-400" },
  ];

  return (
    <div className="min-h-screen cyber-grid">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Link href="/scanner" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Scanner
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-cyan-400" />
              <h1 className="text-2xl font-bold text-white">Scan Results</h1>
              {summary.total === 0 ? (
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-orange-400" />
              )}
            </div>
            <p className="text-gray-400 text-sm font-mono">Scan ID: {scanResult.scan_id}</p>
            <p className="text-gray-400 text-sm">{scanResult.filename} · {scanResult.scanned_at.split("T")[0]}</p>
          </div>

          <div className="flex gap-3">
            {summary.total > 0 && (
              <button
                onClick={handleGenerateAllPatches}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-lg transition-all"
              >
                <Wrench className="w-4 h-4" />
                Generate Patches
              </button>
            )}
            <button
              onClick={handleDownloadReport}
              disabled={isDownloading}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white font-semibold rounded-lg transition-all"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
          {[
            { label: "Total", count: summary.total, cls: "border-gray-700" },
            { label: "Critical", count: summary.critical, cls: "border-red-500/30 bg-red-500/5" },
            { label: "High", count: summary.high, cls: "border-orange-500/30 bg-orange-500/5" },
            { label: "Medium", count: summary.medium, cls: "border-yellow-500/30 bg-yellow-500/5" },
            { label: "Low", count: summary.low, cls: "border-blue-500/30 bg-blue-500/5" },
            { label: "Info", count: summary.info, cls: "border-gray-700 bg-gray-800/30" },
          ].map((s) => (
            <div key={s.label} className={`p-3 rounded-lg bg-gray-900 border text-center ${s.cls}`}>
              <div className="text-2xl font-bold text-white">{s.count}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {summary.total === 0 && (
          <div className="text-center py-20">
            <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Vulnerabilities Found!</h2>
            <p className="text-gray-400">PATCHPILOT found no security issues in this code.</p>
          </div>
        )}

        {summary.total > 0 && (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    filter === tab.key
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "border-gray-800 text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <span className={tab.color}>{tab.label}</span>
                  <span className="ml-2 text-gray-500">{tab.count}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Info className="w-10 h-10 mx-auto mb-3" />
                  No {filter} vulnerabilities found.
                </div>
              ) : (
                filtered.map((vuln) => (
                  <VulnerabilityCard key={vuln.id} vuln={vuln} scanId={scanId} />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
