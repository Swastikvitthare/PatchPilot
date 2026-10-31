'use client';

import { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Loader2,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
} from 'lucide-react';
import { ScanResult, PatchResult, RescanResult } from '@/types';
import { rescanCode } from '@/lib/api';

interface PatchViewProps {
  scanResult: ScanResult;
  patchResult: PatchResult;
  rescanResult: RescanResult | null;
  onRescanComplete: (result: RescanResult) => void;
  onViewReport: () => void;
}

export default function PatchView({
  scanResult,
  patchResult,
  rescanResult,
  onRescanComplete,
  onViewReport,
}: PatchViewProps) {
  const [rescanning, setRescanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [diffView, setDiffView] = useState<'split' | 'unified'>('split');

  const handleRescan = async () => {
    setRescanning(true);
    setError(null);
    try {
      const result = await rescanCode(scanResult.scan_id, patchResult.patched_code);
      onRescanComplete(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Re-scan failed');
    } finally {
      setRescanning(false);
    }
  };

  const handleCopyPatch = async () => {
    await navigator.clipboard.writeText(patchResult.patched_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple diff computation
  const diffLines = useMemo(() => {
    const origLines = patchResult.original_code.split('\n');
    const patchLines = patchResult.patched_code.split('\n');
    const maxLen = Math.max(origLines.length, patchLines.length);
    const result: Array<{
      lineNum: number;
      original: string;
      patched: string;
      type: 'same' | 'changed' | 'added' | 'removed';
    }> = [];

    for (let i = 0; i < maxLen; i++) {
      const orig = origLines[i] ?? '';
      const patch = patchLines[i] ?? '';
      let type: 'same' | 'changed' | 'added' | 'removed' = 'same';
      if (i >= origLines.length) type = 'added';
      else if (i >= patchLines.length) type = 'removed';
      else if (orig !== patch) type = 'changed';
      result.push({ lineNum: i + 1, original: orig, patched: patch, type });
    }
    return result;
  }, [patchResult]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="text-cyber-green" size={32} />
            AI Patch Workspace
          </h1>
          <p className="text-cyber-muted mt-2">
            {patchResult.patches_applied.length} patches applied · Compare original vs. corrected code
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCopyPatch}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cyber-border
              text-cyber-text hover:bg-white/5 transition-colors text-sm"
          >
            {copied ? <Check size={16} className="text-cyber-green" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Patched Code'}
          </button>
          <button
            onClick={handleRescan}
            disabled={rescanning}
            className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm
              bg-cyber-accent text-cyber-bg hover:bg-cyber-accent/90 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {rescanning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Re-scanning...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Re-scan Patched Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Patches Applied */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Patches Applied</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {patchResult.patches_applied.map((patch, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-cyber-green/5 border border-cyber-green/20"
            >
              <CheckCircle2 size={18} className="text-cyber-green mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">{patch.description}</p>
                <p className="text-xs text-cyber-muted mt-1">
                  {patch.rule_id}
                  {patch.line_number && ` · Line ${patch.line_number}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Explanation */}
      {patchResult.ai_explanation && (
        <div className="mb-6 p-4 rounded-xl bg-cyber-accent/5 border border-cyber-accent/20">
          <h3 className="text-sm font-semibold text-cyber-accent mb-2">AI Analysis</h3>
          <p className="text-sm text-cyber-text whitespace-pre-wrap leading-relaxed">
            {patchResult.ai_explanation}
          </p>
        </div>
      )}

      {/* Re-scan Results */}
      {rescanResult && (
        <div className="mb-6 p-4 rounded-xl bg-cyber-card border border-cyber-border">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <RefreshCw size={18} className="text-cyber-accent" />
            Re-scan Results
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-red-900/10 border border-red-500/20">
              <div className="text-2xl font-bold text-red-400">
                {rescanResult.original_scan.summary.total}
              </div>
              <div className="text-xs text-cyber-muted">Original Issues</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-cyber-green/10 border border-cyber-green/20">
              <div className="text-2xl font-bold text-cyber-green">
                {rescanResult.vulnerabilities_fixed}
              </div>
              <div className="text-xs text-cyber-muted">Fixed</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-yellow-900/10 border border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-400">
                {rescanResult.vulnerabilities_remaining}
              </div>
              <div className="text-xs text-cyber-muted">Remaining</div>
            </div>
          </div>
          {rescanResult.vulnerabilities_remaining === 0 && (
            <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-cyber-green/10 text-cyber-green">
              <ShieldCheck size={18} />
              <span className="text-sm font-medium">
                All vulnerabilities have been resolved!
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
          <XCircle size={18} />
          {error}
        </div>
      )}

      {/* Diff View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Code Comparison</h2>
        <div className="flex rounded-lg border border-cyber-border overflow-hidden">
          <button
            onClick={() => setDiffView('split')}
            className={`px-4 py-1.5 text-sm transition-colors ${
              diffView === 'split'
                ? 'bg-cyber-accent/10 text-cyber-accent'
                : 'text-cyber-muted hover:text-white'
            }`}
          >
            Split
          </button>
          <button
            onClick={() => setDiffView('unified')}
            className={`px-4 py-1.5 text-sm transition-colors ${
              diffView === 'unified'
                ? 'bg-cyber-accent/10 text-cyber-accent'
                : 'text-cyber-muted hover:text-white'
            }`}
          >
            Unified
          </button>
        </div>
      </div>

      {/* Diff Display */}
      <div className="rounded-xl border border-cyber-border overflow-hidden bg-[#0d1117]">
        {diffView === 'split' ? (
          <div className="grid grid-cols-2 divide-x divide-cyber-border">
            {/* Original */}
            <div>
              <div className="px-4 py-2 bg-red-900/10 border-b border-cyber-border text-sm font-medium text-red-400 flex items-center gap-2">
                <XCircle size={14} />
                Original ({scanResult.filename})
              </div>
              <pre className="p-4 text-sm font-mono overflow-x-auto max-h-[600px] overflow-y-auto">
                {diffLines.map((line) => (
                  <div
                    key={`orig-${line.lineNum}`}
                    className={`flex ${
                      line.type === 'changed' || line.type === 'removed'
                        ? 'bg-red-900/10'
                        : ''
                    }`}
                  >
                    <span className="w-10 text-right pr-3 text-cyber-muted/50 select-none shrink-0">
                      {line.lineNum}
                    </span>
                    <span
                      className={
                        line.type === 'changed' || line.type === 'removed'
                          ? 'text-red-300'
                          : 'text-gray-300'
                      }
                    >
                      {line.original}
                    </span>
                  </div>
                ))}
              </pre>
            </div>

            {/* Patched */}
            <div>
              <div className="px-4 py-2 bg-green-900/10 border-b border-cyber-border text-sm font-medium text-green-400 flex items-center gap-2">
                <CheckCircle2 size={14} />
                Patched ({scanResult.filename})
              </div>
              <pre className="p-4 text-sm font-mono overflow-x-auto max-h-[600px] overflow-y-auto">
                {diffLines.map((line) => (
                  <div
                    key={`patch-${line.lineNum}`}
                    className={`flex ${
                      line.type === 'changed' || line.type === 'added'
                        ? 'bg-green-900/10'
                        : ''
                    }`}
                  >
                    <span className="w-10 text-right pr-3 text-cyber-muted/50 select-none shrink-0">
                      {line.lineNum}
                    </span>
                    <span
                      className={
                        line.type === 'changed' || line.type === 'added'
                          ? 'text-green-300'
                          : 'text-gray-300'
                      }
                    >
                      {line.patched}
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        ) : (
          /* Unified view */
          <div>
            <div className="px-4 py-2 bg-cyber-card border-b border-cyber-border text-sm font-medium text-cyber-text flex items-center gap-2">
              <ArrowRight size={14} className="text-cyber-accent" />
              Unified Diff
            </div>
            <pre className="p-4 text-sm font-mono overflow-x-auto max-h-[700px] overflow-y-auto">
              {diffLines.map((line) => {
                if (line.type === 'same') {
                  return (
                    <div key={`u-${line.lineNum}`} className="flex">
                      <span className="w-10 text-right pr-3 text-cyber-muted/50 select-none shrink-0">
                        {line.lineNum}
                      </span>
                      <span className="text-gray-400">&nbsp; {line.original}</span>
                    </div>
                  );
                }
                return (
                  <div key={`u-${line.lineNum}`}>
                    {(line.type === 'changed' || line.type === 'removed') && (
                      <div className="flex bg-red-900/10">
                        <span className="w-10 text-right pr-3 text-red-400/50 select-none shrink-0">
                          {line.lineNum}
                        </span>
                        <span className="text-red-300">- {line.original}</span>
                      </div>
                    )}
                    {(line.type === 'changed' || line.type === 'added') && (
                      <div className="flex bg-green-900/10">
                        <span className="w-10 text-right pr-3 text-green-400/50 select-none shrink-0">
                          {line.lineNum}
                        </span>
                        <span className="text-green-300">+ {line.patched}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </pre>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onViewReport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm
            bg-cyber-accent text-cyber-bg hover:bg-cyber-accent/90 transition-all"
        >
          <FileText size={16} />
          Generate Report
        </button>
      </div>
    </div>
  );
}
