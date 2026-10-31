'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  Lightbulb,
  Plus,
} from 'lucide-react';
import { ScanResult, PatchResult, VulnerabilityDetail } from '@/types';
import { generatePatch, explainVulnerability } from '@/lib/api';

interface ResultsViewProps {
  scanResult: ScanResult;
  originalCode: string;
  onPatchGenerated: (result: PatchResult) => void;
  onViewReport: () => void;
  onNewScan: () => void;
}

const severityConfig = {
  critical: { icon: AlertOctagon, color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-500/30', label: 'Critical' },
  high: { icon: ShieldAlert, color: 'text-orange-400', bg: 'bg-orange-900/20', border: 'border-orange-500/30', label: 'High' },
  medium: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-500/30', label: 'Medium' },
  low: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-500/30', label: 'Low' },
  info: { icon: Info, color: 'text-gray-400', bg: 'bg-gray-800/20', border: 'border-gray-600/30', label: 'Info' },
};

export default function ResultsView({
  scanResult,
  originalCode,
  onPatchGenerated,
  onViewReport,
  onNewScan,
}: ResultsViewProps) {
  const [expandedVuln, setExpandedVuln] = useState<number | null>(null);
  const [patching, setPatching] = useState(false);
  const [explaining, setExplaining] = useState<number | null>(null);
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  const handlePatchAll = async () => {
    setPatching(true);
    setError(null);
    try {
      const result = await generatePatch(scanResult.scan_id);
      onPatchGenerated(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Patch generation failed');
    } finally {
      setPatching(false);
    }
  };

  const handleExplain = async (index: number) => {
    if (explanations[index]) {
      setExpandedVuln(expandedVuln === index ? null : index);
      return;
    }
    setExplaining(index);
    try {
      const result = await explainVulnerability(scanResult.scan_id, index);
      setExplanations((prev) => ({ ...prev, [index]: result.explanation }));
      setExpandedVuln(index);
    } catch {
      setExplanations((prev) => ({
        ...prev,
        [index]: 'Explanation unavailable. The AI service may be offline.',
      }));
      setExpandedVuln(index);
    } finally {
      setExplaining(null);
    }
  };

  const { summary, vulnerabilities } = scanResult;
  const totalVulns = summary.total;
  const isClean = totalVulns === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {isClean ? (
              <ShieldCheck className="text-cyber-green" size={32} />
            ) : (
              <ShieldAlert className="text-cyber-red" size={32} />
            )}
            Scan Results
          </h1>
          <p className="text-cyber-muted mt-2">
            {scanResult.filename} · Scanned in {scanResult.scan_time.toFixed(2)}s
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onViewReport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cyber-border
              text-cyber-text hover:bg-white/5 transition-colors text-sm"
          >
            <FileText size={16} />
            View Report
          </button>
          {!isClean && (
            <button
              onClick={handlePatchAll}
              disabled={patching}
              className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm
                bg-cyber-green/10 text-cyber-green border border-cyber-green/30
                hover:bg-cyber-green/20 transition-all disabled:opacity-50"
            >
              {patching ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating Patches...
                </>
              ) : (
                <>
                  <Wrench size={16} />
                  Fix All Vulnerabilities
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {(['critical', 'high', 'medium', 'low', 'info'] as const).map((sev) => {
          const config = severityConfig[sev];
          const Icon = config.icon;
          const count = summary[sev];
          return (
            <div
              key={sev}
              className={`p-4 rounded-xl ${config.bg} border ${config.border} text-center`}
            >
              <Icon size={20} className={`${config.color} mx-auto mb-2`} />
              <div className={`text-2xl font-bold ${config.color}`}>{count}</div>
              <div className="text-xs text-cyber-muted mt-1">{config.label}</div>
            </div>
          );
        })}
        <div className="p-4 rounded-xl bg-cyber-card border border-cyber-border text-center">
          <Shield size={20} className="text-cyber-accent mx-auto mb-2" />
          <div className="text-2xl font-bold text-cyber-accent">{totalVulns}</div>
          <div className="text-xs text-cyber-muted mt-1">Total</div>
        </div>
      </div>

      {/* Clean State */}
      {isClean && (
        <div className="text-center py-20">
          <ShieldCheck size={64} className="text-cyber-green mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cyber-green mb-2">No Vulnerabilities Found</h2>
          <p className="text-cyber-muted mb-8">Your code passed all security checks.</p>
          <button
            onClick={onNewScan}
            className="flex items-center gap-2 px-6 py-3 rounded-lg mx-auto
              bg-cyber-accent text-cyber-bg font-semibold hover:bg-cyber-accent/90 transition-all"
          >
            <Plus size={18} />
            Scan Another File
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {/* Vulnerability List */}
      {!isClean && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            Findings ({totalVulns})
          </h2>

          {vulnerabilities.map((vuln: VulnerabilityDetail, index: number) => {
            const config = severityConfig[vuln.severity];
            const Icon = config.icon;
            const isExpanded = expandedVuln === index;

            return (
              <div
                key={index}
                className={`rounded-xl ${config.bg} border ${config.border} overflow-hidden transition-all`}
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedVuln(isExpanded ? null : index)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/5 transition-colors"
                >
                  <Icon size={20} className={config.color} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-medium uppercase`}>
                        {vuln.severity}
                      </span>
                      <span className="font-semibold text-white truncate">
                        {vuln.title}
                      </span>
                      {vuln.cwe_id && (
                        <span className="text-xs text-cyber-muted">
                          {vuln.cwe_id}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-cyber-muted mt-1 truncate">
                      {vuln.rule_id}
                      {vuln.line_number && ` · Line ${vuln.line_number}`}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-cyber-muted" />
                  ) : (
                    <ChevronDown size={18} className="text-cyber-muted" />
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-white/5">
                    <p className="text-sm text-cyber-text mt-4 leading-relaxed">
                      {vuln.description}
                    </p>

                    {vuln.snippet && (
                      <div className="mt-4">
                        <span className="text-xs text-cyber-muted uppercase tracking-wider">
                          Vulnerable Code
                        </span>
                        <pre className="mt-2 p-3 rounded-lg bg-black/30 text-sm font-mono text-red-300 overflow-x-auto">
                          {vuln.line_number && (
                            <span className="text-cyber-muted mr-4">
                              {vuln.line_number} │
                            </span>
                          )}
                          {vuln.snippet}
                        </pre>
                      </div>
                    )}

                    {/* AI Explanation */}
                    {explanations[index] && (
                      <div className="mt-4 p-4 rounded-lg bg-cyber-accent/5 border border-cyber-accent/20">
                        <div className="flex items-center gap-2 text-cyber-accent text-sm font-medium mb-2">
                          <Lightbulb size={16} />
                          AI Explanation
                        </div>
                        <p className="text-sm text-cyber-text whitespace-pre-wrap leading-relaxed">
                          {explanations[index]}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleExplain(index)}
                        disabled={explaining === index}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                          bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30
                          hover:bg-cyber-accent/20 transition-colors disabled:opacity-50"
                      >
                        {explaining === index ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Analyzing...
                          </>
                        ) : explanations[index] ? (
                          <>
                            <Lightbulb size={14} />
                            Hide Explanation
                          </>
                        ) : (
                          <>
                            <Lightbulb size={14} />
                            Explain with AI
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
