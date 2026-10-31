"use client";
import React, { useState, useCallback, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Shield, Upload, Play, Code2, AlertCircle, Loader2, Sparkles,
  CheckCircle2, RefreshCw, Download, FileText, ChevronRight,
  AlertTriangle, Key, Zap, Check, Eye
} from "lucide-react";
import { scanCode, generatePatches, rescanCode, generateReport } from "@/lib/api";
import { ScanResult, Vulnerability, PatchResult } from "@/lib/types";
import FileUpload from "@/components/scanner/FileUpload";
import DiffViewer from "@/components/patch/DiffViewer";
import SeverityBadge from "@/components/results/SeverityBadge";

const CodeEditor = dynamic(() => import("@/components/scanner/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
    </div>
  ),
});

const PRESETS = {
  full: `"""
PATCHPILOT Demo — Intentionally Vulnerable Python Suite
Find the flaw. Fix the code. Prove the patch.
"""
import os
import pickle
import random

# CWE-798: Hardcoded Credentials
DB_PASSWORD = "admin123!supersecret"
AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE"

def get_user_records(username: str):
    # CWE-89: SQL Injection via f-string formatting
    query = f"SELECT * FROM users WHERE username = '{username}'"
    cursor.execute(query)
    return cursor.fetchall()

def execute_user_utility(user_command: str):
    # CWE-78: OS Command Injection
    os.system("backup_utility --target " + user_command)

def calculate_formula(expression: str):
    # CWE-95: Dangerous Code Injection via eval()
    return eval(expression)

def restore_session_payload(data: bytes):
    # CWE-502: Insecure Deserialization via pickle
    return pickle.loads(data)

from flask import Flask
app = Flask(__name__)
# CWE-94: Security Misconfiguration
app.run(debug=True, host="0.0.0.0")
`,
  sqli: `"""
SQL Injection Vulnerability Example (CWE-89)
"""
import sqlite3

def find_account(account_id: str):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    # Vulnerable: Unsanitized string concatenation into SQL
    query = "SELECT balance, ssn FROM accounts WHERE id = '" + account_id + "'"
    cursor.execute(query)
    return cursor.fetchone()
`,
  creds: `"""
Hardcoded Secrets & API Keys Example (CWE-798)
"""
DATABASE_PASSWORD = "prod_db_master_password_99#"
API_SECRET_TOKEN = "sec_demo_credential_token_value_99999"
AUTH_ACCESS_TOKEN = "token_example_mock_9999999999999999"

def connect_db():
    print("Connecting with secret credentials...")
`,
  eval: `"""
Arbitrary Code & Command Injection Example (CWE-95 / CWE-78)
"""
import os

def run_math_engine(user_input: str):
    # Dangerous eval of untrusted client input
    result = eval(user_input)
    return result

def ping_server(target_ip: str):
    # Command injection via shell command string
    os.system("ping -c 1 " + target_ip)
`,
};

export default function ScannerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      }
    >
      <ScannerWorkspace />
    </Suspense>
  );
}

function ScannerWorkspace() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  const [code, setCode] = useState(isDemo ? PRESETS.full : PRESETS.full);
  const [filename, setFilename] = useState("vulnerable_app.py");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Patching & Verification State
  const [isPatching, setIsPatching] = useState(false);
  const [patchResult, setPatchResult] = useState<PatchResult | null>(null);
  const [isRescanning, setIsRescanning] = useState(false);
  const [rescanResult, setRescanResult] = useState<ScanResult | null>(null);
  const [activeSeverity, setActiveSeverity] = useState<string>("all");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleScan = useCallback(async (codeToScan?: string, fileToScan?: string) => {
    const targetCode = codeToScan ?? code;
    const targetFile = fileToScan ?? filename;

    if (!targetCode.trim()) {
      setError("Please paste or upload Python code to scan.");
      return;
    }

    setError(null);
    setIsScanning(true);
    setPatchResult(null);
    setRescanResult(null);

    try {
      const result: ScanResult = await scanCode(targetCode, "python", targetFile);
      setScanResult(result);

      // Save for other views if user navigates
      try {
        sessionStorage.setItem("scan_latest", JSON.stringify(result));
        sessionStorage.setItem(`scan_${result.scan_id}`, JSON.stringify(result));
        sessionStorage.setItem("code_latest", targetCode);
        sessionStorage.setItem(`code_${result.scan_id}`, targetCode);
      } catch {
        /* ignore storage quota */
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Scanning failed.";
      setError(msg);
    } finally {
      setIsScanning(false);
    }
  }, [code, filename]);

  // Auto-scan demo if query parameter ?demo=true is present
  useEffect(() => {
    if (isDemo && !scanResult) {
      handleScan(PRESETS.full, "demo_suite.py");
    }
  }, [isDemo, scanResult, handleScan]);

  const handleLoadPreset = (key: keyof typeof PRESETS, label: string) => {
    setCode(PRESETS[key]);
    setFilename(label);
    setError(null);
    setScanResult(null);
    setPatchResult(null);
    setRescanResult(null);
  };

  const handleGeneratePatches = async () => {
    if (!scanResult) return;
    setIsPatching(true);
    setError(null);

    try {
      const patches = await generatePatches(code, scanResult.vulnerabilities, scanResult.scan_id);
      setPatchResult(patches);

      try {
        sessionStorage.setItem("patch_latest", JSON.stringify(patches));
        sessionStorage.setItem(`patch_${scanResult.scan_id}`, JSON.stringify(patches));
      } catch {
        /* ignore */
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Patch generation failed.";
      setError(msg);
    } finally {
      setIsPatching(false);
    }
  };

  const handleRescanPatched = async () => {
    if (!patchResult) return;
    setIsRescanning(true);
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
    if (!scanResult) return;
    setIsDownloading(true);
    try {
      const blob = await generateReport({
        scan_id: scanResult.scan_id,
        original_code: code,
        patched_code: patchResult?.patched_code_full,
        vulnerabilities: scanResult.vulnerabilities,
        patches: patchResult?.patches,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `patchpilot-security-report-${scanResult.scan_id.slice(0, 8)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to generate security audit report.");
    } finally {
      setIsDownloading(false);
    }
  };

  const filteredVulns = scanResult
    ? activeSeverity === "all"
      ? scanResult.vulnerabilities
      : scanResult.vulnerabilities.filter((v) => v.severity === activeSeverity)
    : [];

  return (
    <div className="min-h-screen cyber-grid py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Security Scanning & Patch Studio
                </h1>
                <p className="text-xs text-gray-400">
                  AST Static Analysis · Google Gemma 4 Vulnerability Remediation · Mathematical Proof
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Engine Online (Browser + Cloud)
            </span>
          </div>
        </div>

        {/* Preset Selector Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-900/60 rounded-xl border border-gray-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-400 font-semibold uppercase tracking-wider">Presets:</span>
            <button
              onClick={() => handleLoadPreset("full", "vulnerable_suite.py")}
              className="px-2.5 py-1 rounded bg-gray-800 hover:bg-cyan-500/20 hover:text-cyan-400 text-gray-300 font-mono transition-all"
            >
              Full Vulnerable Suite
            </button>
            <button
              onClick={() => handleLoadPreset("sqli", "sqli_vuln.py")}
              className="px-2.5 py-1 rounded bg-gray-800 hover:bg-orange-500/20 hover:text-orange-400 text-gray-300 font-mono transition-all"
            >
              SQL Injection (CWE-89)
            </button>
            <button
              onClick={() => handleLoadPreset("creds", "secrets_leak.py")}
              className="px-2.5 py-1 rounded bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-300 font-mono transition-all"
            >
              Hardcoded Credentials (CWE-798)
            </button>
            <button
              onClick={() => handleLoadPreset("eval", "code_exec.py")}
              className="px-2.5 py-1 rounded bg-gray-800 hover:bg-yellow-500/20 hover:text-yellow-400 text-gray-300 font-mono transition-all"
            >
              Eval / OS Command (CWE-95)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <FileUpload
              onFileUpload={(content, name) => {
                setCode(content);
                setFilename(name);
                setError(null);
                setScanResult(null);
              }}
            />
          </div>
        </div>

        {/* Editor & Scan Button Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Target: <strong className="text-white">{filename}</strong></span>
              <span className="text-gray-600">·</span>
              <span>{code.split("\n").length} lines</span>
            </div>

            <button
              onClick={() => handleScan()}
              disabled={isScanning}
              className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-700 text-gray-950 font-bold rounded-lg transition-all glow-cyan text-sm"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing AST...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Scan Code Now
                </>
              )}
            </button>
          </div>

          <CodeEditor value={code} onChange={(val) => setCode(val || "")} />

          {error && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ── Scan Results Section ── */}
        {scanResult && (
          <div className="space-y-6 pt-6 border-t border-gray-800 animate-in fade-in-50 duration-300">
            {/* Results Header / Stats */}
            <div className="p-6 bg-gray-900/80 rounded-2xl border border-gray-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                      Audit Complete · Scan ID: {scanResult.scan_id}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mt-1">
                    Found {scanResult.summary.total} Security Vulnerabilities
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleGeneratePatches}
                    disabled={isPatching || scanResult.vulnerabilities.length === 0}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-90 disabled:opacity-50 text-gray-950 font-bold rounded-xl transition-all shadow-lg glow-cyan text-sm"
                  >
                    {isPatching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Gemma 4 Generating Patches...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Fix Code with Gemma 4 AI
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadReport}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white text-sm font-semibold transition-all"
                  >
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Download Report
                  </button>
                </div>
              </div>

              {/* Severity Counts Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
                <div
                  onClick={() => setActiveSeverity("all")}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${activeSeverity === "all" ? "bg-gray-800 border-cyan-400" : "bg-gray-900/50 border-gray-800 hover:border-gray-700"}`}
                >
                  <div className="text-xs text-gray-400 font-mono">ALL</div>
                  <div className="text-2xl font-bold text-white">{scanResult.summary.total}</div>
                </div>
                <div
                  onClick={() => setActiveSeverity("critical")}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${activeSeverity === "critical" ? "bg-red-950/40 border-red-500" : "bg-gray-900/50 border-gray-800 hover:border-gray-700"}`}
                >
                  <div className="text-xs text-red-400 font-mono">CRITICAL</div>
                  <div className="text-2xl font-bold text-red-400">{scanResult.summary.critical}</div>
                </div>
                <div
                  onClick={() => setActiveSeverity("high")}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${activeSeverity === "high" ? "bg-orange-950/40 border-orange-500" : "bg-gray-900/50 border-gray-800 hover:border-gray-700"}`}
                >
                  <div className="text-xs text-orange-400 font-mono">HIGH</div>
                  <div className="text-2xl font-bold text-orange-400">{scanResult.summary.high}</div>
                </div>
                <div
                  onClick={() => setActiveSeverity("medium")}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${activeSeverity === "medium" ? "bg-yellow-950/40 border-yellow-500" : "bg-gray-900/50 border-gray-800 hover:border-gray-700"}`}
                >
                  <div className="text-xs text-yellow-400 font-mono">MEDIUM</div>
                  <div className="text-2xl font-bold text-yellow-400">{scanResult.summary.medium}</div>
                </div>
                <div
                  onClick={() => setActiveSeverity("low")}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${activeSeverity === "low" ? "bg-blue-950/40 border-blue-500" : "bg-gray-900/50 border-gray-800 hover:border-gray-700"}`}
                >
                  <div className="text-xs text-blue-400 font-mono">LOW</div>
                  <div className="text-2xl font-bold text-blue-400">{scanResult.summary.low}</div>
                </div>
                <div
                  onClick={() => setActiveSeverity("info")}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${activeSeverity === "info" ? "bg-gray-800 border-gray-500" : "bg-gray-900/50 border-gray-800 hover:border-gray-700"}`}
                >
                  <div className="text-xs text-gray-400 font-mono">INFO</div>
                  <div className="text-2xl font-bold text-gray-300">{scanResult.summary.info}</div>
                </div>
              </div>
            </div>

            {/* Vulnerability Cards List */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Vulnerabilities Detected</span>
                <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                  Showing {filteredVulns.length}
                </span>
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {filteredVulns.map((vuln) => (
                  <div
                    key={vuln.id}
                    className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 hover:border-gray-700 space-y-3 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <SeverityBadge severity={vuln.severity} />
                        <span className="font-semibold text-white text-base">{vuln.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                        <span className="bg-gray-800 px-2 py-1 rounded text-cyan-400">{vuln.cwe_id}</span>
                        <span className="bg-gray-800 px-2 py-1 rounded">{vuln.rule_id}</span>
                        <span className="text-gray-500">Line {vuln.line_start}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400 leading-relaxed">{vuln.description}</p>

                    {/* Code Snippet */}
                    <div className="rounded-lg bg-gray-950 p-3 border border-red-500/20 font-mono text-xs text-red-300 overflow-x-auto">
                      <div className="text-gray-500 text-[10px] mb-1 font-bold">VULNERABLE SNIPPET (LINE {vuln.line_start}):</div>
                      {vuln.code_snippet}
                    </div>

                    {/* Recommendation */}
                    <div className="text-xs text-emerald-400/90 bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-emerald-300">Gemma 4 Remediation: </strong>
                        <span>{vuln.recommendation}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Patches & Diff Viewer Section ── */}
            {patchResult && (
              <div className="pt-8 border-t border-gray-800 space-y-6 animate-in fade-in-50 duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      Patches Synthesized by Google Gemma 4
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      Remediated Code & Side-by-Side Diff
                    </h2>
                    <p className="text-sm text-gray-400">
                      Applied {patchResult.patches.length} security patches directly to source code.
                    </p>
                  </div>

                  <button
                    onClick={handleRescanPatched}
                    disabled={isRescanning}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-gray-950 font-bold rounded-xl transition-all shadow-lg glow-cyan text-sm"
                  >
                    {isRescanning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Re-scanning Patched Code...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Re-scan to Prove Patch
                      </>
                    )}
                  </button>
                </div>

                {/* Diff Viewer Component */}
                <DiffViewer original={code} patched={patchResult.patched_code_full} />

                {/* ── Re-scan Verification Result ── */}
                {rescanResult && (
                  <div className="p-6 rounded-2xl bg-emerald-950/30 border-2 border-emerald-500/50 space-y-3 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          Patch Re-scan Verified: {rescanResult.summary.total} Remaining Vulnerabilities
                        </h3>
                        <p className="text-sm text-emerald-300">
                          {rescanResult.summary.total === 0
                            ? "100% of detected vulnerabilities were eliminated. All code is secured against CWE-89, CWE-798, and CWE-95."
                            : `${rescanResult.summary.total} remaining advisories.`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={handleDownloadReport}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl transition-all text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download Verified Audit Certificate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
