"use client";
import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Shield, Upload, Play, Code2, AlertCircle, Loader2 } from "lucide-react";
import { scanCode } from "@/lib/api";
import { ScanResult } from "@/lib/types";
import FileUpload from "@/components/scanner/FileUpload";

const CodeEditor = dynamic(() => import("@/components/scanner/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
    </div>
  ),
});

const DEMO_CODE = `"""
PATCHPILOT Demo — Intentionally Vulnerable Python
"""
import pickle
import os
import random

# Hardcoded credentials — NEVER do this
DB_PASSWORD = "admin123!secret"
API_KEY = "AKIAIOSFODNN7EXAMPLE"

def get_user(username):
    # SQL Injection via f-string
    query = f"SELECT * FROM users WHERE username = '{username}'"
    cursor.execute(query)
    return cursor.fetchall()

def run_command(cmd):
    # OS command injection
    os.system("process " + cmd)

def parse_expression(expr):
    # Dangerous eval()
    return eval(expr)

def load_session(data: bytes):
    # Insecure pickle deserialization
    return pickle.loads(data)

def generate_token():
    # Predictable PRNG
    return str(random.randint(100000, 999999))

from flask import Flask, request
app = Flask(__name__)
app.run(debug=True, host="0.0.0.0")
`;

function ScannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  const [code, setCode] = useState(isDemo ? DEMO_CODE : "");
  const [language] = useState("python");
  const [filename, setFilename] = useState("uploaded_code.py");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = useCallback(async () => {
    if (!code.trim()) {
      setError("Please enter or upload Python code before scanning.");
      return;
    }
    setError(null);
    setIsScanning(true);
    try {
      const result: ScanResult = await scanCode(code, language, filename);
      // Store in sessionStorage for results page
      sessionStorage.setItem(`scan_${result.scan_id}`, JSON.stringify(result));
      sessionStorage.setItem(`code_${result.scan_id}`, code);
      router.push(`/results/${result.scan_id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Scan failed. Please check the backend is running.";
      setError(message);
    } finally {
      setIsScanning(false);
    }
  }, [code, language, filename, router]);

  const handleFileUpload = useCallback((content: string, name: string) => {
    setCode(content);
    setFilename(name);
    setError(null);
  }, []);

  const handleLoadDemo = useCallback(() => {
    setCode(DEMO_CODE);
    setFilename("vulnerable_example.py");
    setError(null);
  }, []);

  return (
    <div className="min-h-screen cyber-grid">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">Code Scanner</h1>
          </div>
          <p className="text-gray-400">
            Paste Python code or upload a file. PATCHPILOT analyzes using AST — your code is never executed.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-sm text-gray-400">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span className="font-mono">{filename}</span>
          </div>

          <button
            onClick={handleLoadDemo}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-gray-700 hover:border-gray-600 text-gray-400 hover:text-white text-sm transition-all"
          >
            Load Demo
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <FileUpload onFileUpload={handleFileUpload} />

            <button
              onClick={handleScan}
              disabled={isScanning}
              className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-700 disabled:cursor-not-allowed text-gray-950 font-bold rounded-lg transition-all glow-cyan"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Scan Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Editor */}
        <div className="rounded-xl overflow-hidden border border-gray-800 bg-gray-900">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-950 border-b border-gray-800">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
            <span className="ml-3 text-xs text-gray-500 font-mono">{filename}</span>
          </div>
          <CodeEditor
            value={code}
            onChange={(v) => setCode(v || "")}
            language={language}
            height="600px"
          />
        </div>

        {/* Info bar */}
        <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Code is analyzed statically — never executed
          </span>
          <span>{code.split("\n").length} lines</span>
          <span>{new Blob([code]).size} bytes</span>
        </div>
      </div>
    </div>
  );
}

export default function ScannerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>}>
      <ScannerContent />
    </Suspense>
  );
}
