"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Wrench, ChevronLeft, Download, RefreshCw, CheckCircle,
  AlertTriangle, Loader2, Bot, XCircle, Info,
} from "lucide-react";
import { ScanResult, Patch, PatchResult } from "@/lib/types";
import { generatePatches, rescanCode, generateReport } from "@/lib/api";

const DiffViewer = dynamic(() => import("@/components/patch/DiffViewer"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-900 rounded-lg flex items-center justify-center"><Loader2 className="w-6 h-6 text-cyan-400 animate-spin" /></div>,
});

export default function PatchPage() {
  const params = useParams();
  const router = useRouter();
  const scanId = params.id as string;

  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [originalCode, setOriginalCode] = useState("");
  const [patchResult, setPatchResult] = useState<PatchResult | null>(null);
  const [rescanResult, setRescanResult] = useState<ScanResult | null>(null);
  const [selectedPatchIdx, setSelectedPatchIdx] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRescanning, setIsRescanning] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`scan_${scanId}`);
    const code = sessionStorage.getItem(`code_${scanId}`);
    if (stored && code) {
      setScanResult(JSON.parse(stored));
      setOriginalCode(code);
    } else {
      setError("Scan data not found. Please run a scan first.");
    }
  }, [scanId]);

  useEffect(() => {
    if (scanResult && originalCode && !patchResult && !isGenerating) {
      handleGeneratePatches();
    }
  }, [scanResult, originalCode]);

  const handleGeneratePatches = async () => {
    if (!scanResult) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generatePatches(originalCode, scanResult.vulnerabilities, scanId);
      setPatchResult(result);
      sessionStorage.setItem(`patch_${scanId}`, JSON.stringify(result));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate patches.";
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRescan = async () => {
    if (!patchResult) return;
    setIsRescanning(true);
    setError(null);
    try {
      const result = await rescanCode(patchResult.patched_code_full, "python");
      setRescanResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Re-scan failed.";
      setError(msg);
    } finally {
      setIsRescanning(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!scanResult || !patchResult) return;
    setIsDownloading(true);
    try {
      const blob = await generateReport({
        scan_id: scanId,
        original_code: originalCode,
        patched_code: patchResult.patched_code_full,
        vulnerabilities: scanResult.vulnerabilities,
        patches: patchResult.patches,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `patchpilot-report-${scanId.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to generate report.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (error && !scanResult) {
    return (
      <div className="min-h-screen flex items-center justify-center cyber-grid">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl text-white font-semibold mb-2">Data Not Found</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/scanner" className="px-6 py-3 bg-cyan-500 text-gray-950 font-bold rounded-lg">
            Start New Scan
          </Link>
        </div>
      </div>
    );
  }

  const currentPatch: Patch | null = patchResult?.patches[selectedPatchIdx] ?? null;
  const currentVuln = scanResult?.vulnerabilities.find(
    (v) => v.id === currentPatch?.vulnerability_id
  );

  return (
    <div className="min-h-screen cyber-grid">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Back */}
        <Link href={`/results/${scanId}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Results
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Wrench className="w-8 h-8 text-emerald-400" />
              <h1 className="text-2xl font-bold text-white">AI Patch Workspace</h1>
              {!patchResult?.ai_available && (
                <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  Rule-based (AI unavailable)
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm font-mono">Scan: {scanId}</p>
          </div>

          <div className="flex gap-3">
            {patchResult && (
              <button
                onClick={handleRescan}
                disabled={isRescanning}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white font-semibold rounded-lg transition-all"
              >
                {isRescanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Re-scan Patched Code
              </button>
            )}
            {patchResult && (
              <button
                onClick={handleDownloadReport}
                disabled={isDownloading}
                className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-lg transition-all"
              >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                PDF Report
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Generating state */}
        {isGenerating && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 scanning-animate">
              <Bot className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-xl text-white font-semibold mb-2">Generating Patches...</h2>
            <p className="text-gray-400">
              {patchResult?.ai_available !== false
                ? "Gemma 4 is analyzing vulnerabilities and generating secure fixes."
                : "Applying rule-based security patches."}
            </p>
          </div>
        )}

        {patchResult && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Patch list sidebar */}
            <div className="lg:col-span-1">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Patches ({patchResult.patches.length})
              </h2>
              <div className="space-y-2">
                {patchResult.patches.map((patch, i) => {
                  const vuln = scanResult?.vulnerabilities.find((v) => v.id === patch.vulnerability_id);
                  return (
                    <button
                      key={patch.vulnerability_id}
                      onClick={() => setSelectedPatchIdx(i)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedPatchIdx === i
                          ? "bg-gray-800 border-cyan-500/50 text-white"
                          : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"
                      }`}
                    >
                      <div className="text-xs font-mono text-emerald-400 mb-1">
                        Patch {i + 1} · {Math.round(patch.confidence * 100)}% confidence
                      </div>
                      <div className="text-sm font-medium truncate">
                        {vuln?.title || "Vulnerability"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main workspace */}
            <div className="lg:col-span-3 space-y-6">
              {currentPatch && currentVuln && (
                <>
                  {/* Vuln summary */}
                  <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
                    <div className="flex items-start gap-3">
                      <div className={`px-2 py-0.5 rounded text-xs font-semibold uppercase severity-${currentVuln.severity}`}>
                        {currentVuln.severity}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{currentVuln.title}</h3>
                        <p className="text-gray-400 text-sm mt-1">{currentVuln.description}</p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 rounded-lg bg-gray-950 border border-gray-800">
                      <div className="flex items-start gap-2">
                        <Bot className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs text-emerald-400 font-semibold mb-1">
                            {patchResult.ai_available ? "Gemma 4 Explanation" : "Rule-based Explanation"}
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {currentPatch.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Diff Viewer */}
                  <DiffViewer
                    original={currentPatch.original_code}
                    patched={currentPatch.patched_code}
                  />
                </>
              )}

              {/* Re-scan results */}
              {rescanResult && (
                <div className={`p-5 rounded-xl border ${
                  rescanResult.summary.critical === 0 && rescanResult.summary.high === 0
                    ? "bg-emerald-950/30 border-emerald-500/30"
                    : "bg-orange-950/30 border-orange-500/30"
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    {rescanResult.summary.critical === 0 && rescanResult.summary.high === 0 ? (
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-orange-400" />
                    )}
                    <h3 className="font-semibold text-white">Re-scan Results</h3>
                  </div>
                  <div className="grid grid-cols-5 gap-3 text-sm">
                    {[
                      { label: "Total", count: rescanResult.summary.total },
                      { label: "Critical", count: rescanResult.summary.critical },
                      { label: "High", count: rescanResult.summary.high },
                      { label: "Medium", count: rescanResult.summary.medium },
                      { label: "Low", count: rescanResult.summary.low },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <div className="text-xl font-bold text-white">{s.count}</div>
                        <div className="text-gray-400">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {rescanResult.summary.total === 0 && (
                    <p className="mt-3 text-emerald-400 text-sm">
                      ✓ Patch verified — no remaining vulnerabilities detected.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
