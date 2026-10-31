'use client';

import { useState } from 'react';
import {
  Download,
  FileText,
  FileJson,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';
import { ScanResult, PatchResult, RescanResult, VulnerabilityDetail } from '@/types';
import { downloadPdfReport, downloadJsonReport } from '@/lib/api';

interface ReportViewProps {
  scanResult: ScanResult;
  patchResult: PatchResult | null;
  rescanResult: RescanResult | null;
}

const severityColors: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-blue-400',
  info: 'text-gray-400',
};

export default function ReportView({
  scanResult,
  patchResult,
  rescanResult,
}: ReportViewProps) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingJson, setDownloadingJson] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    setError(null);
    try {
      const blob = await downloadPdfReport(scanResult.scan_id, !!patchResult);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patchpilot-report-${scanResult.scan_id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download PDF report. Is the backend running?');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadJson = async () => {
    setDownloadingJson(true);
    setError(null);
    try {
      const data = await downloadJsonReport(scanResult.scan_id, !!patchResult);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patchpilot-report-${scanResult.scan_id.slice(0, 8)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download JSON report.');
    } finally {
      setDownloadingJson(false);
    }
  };

  const { summary, vulnerabilities } = scanResult;
  const isClean = summary.total === 0;
  const allFixed = rescanResult?.vulnerabilities_remaining === 0;
  const scannedDate = new Date(scanResult.scanned_at).toLocaleString();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Report Header */}
      <div className="text-center mb-12">
        <Shield size={48} className="text-cyber-accent mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2">Security Report</h1>
        <p className="text-cyber-muted">
          PatchPilot Security Assessment · {scanResult.filename}
        </p>
      </div>

      {/* Download Buttons */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <button
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
          className="flex items-center gap-2 px-6 py-3 rounded-xl
            bg-cyber-accent text-cyber-bg font-semibold
            hover:bg-cyber-accent/90 transition-all disabled:opacity-50"
        >
          {downloadingPdf ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Download size={18} />
          )}
          Download PDF Report
        </button>
        <button
          onClick={handleDownloadJson}
          disabled={downloadingJson}
          className="flex items-center gap-2 px-6 py-3 rounded-xl
            border border-cyber-border text-cyber-text font-semibold
            hover:bg-white/5 transition-all disabled:opacity-50"
        >
          {downloadingJson ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <FileJson size={18} />
          )}
          Download JSON
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-8 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {/* Report Content (Preview) */}
      <div className="space-y-8">
        {/* Executive Summary */}
        <section className="p-6 rounded-xl bg-cyber-card border border-cyber-border">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText size={20} className="text-cyber-accent" />
            Executive Summary
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-cyber-muted mb-1">File Analyzed</p>
              <p className="font-medium">{scanResult.filename}</p>
            </div>
            <div>
              <p className="text-sm text-cyber-muted mb-1">Scan Date</p>
              <p className="font-medium flex items-center gap-2">
                <Clock size={14} /> {scannedDate}
              </p>
            </div>
            <div>
              <p className="text-sm text-cyber-muted mb-1">Scan Duration</p>
              <p className="font-medium">{scanResult.scan_time.toFixed(3)}s</p>
            </div>
            <div>
              <p className="text-sm text-cyber-muted mb-1">Overall Status</p>
              <p className="font-medium flex items-center gap-2">
                {isClean || allFixed ? (
                  <>
                    <ShieldCheck size={16} className="text-cyber-green" />
                    <span className="text-cyber-green">Secure</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert size={16} className="text-cyber-red" />
                    <span className="text-cyber-red">Vulnerabilities Found</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Severity Breakdown */}
        <section className="p-6 rounded-xl bg-cyber-card border border-cyber-border">
          <h2 className="text-xl font-bold mb-4">Severity Breakdown</h2>
          <div className="space-y-3">
            {(['critical', 'high', 'medium', 'low', 'info'] as const).map((sev) => {
              const count = summary[sev];
              const total = summary.total || 1;
              const pct = (count / total) * 100;
              return (
                <div key={sev} className="flex items-center gap-4">
                  <span className={`w-20 text-sm font-medium capitalize ${severityColors[sev]}`}>
                    {sev}
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        sev === 'critical'
                          ? 'bg-red-500'
                          : sev === 'high'
                          ? 'bg-orange-500'
                          : sev === 'medium'
                          ? 'bg-yellow-500'
                          : sev === 'low'
                          ? 'bg-blue-500'
                          : 'bg-gray-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Findings */}
        {!isClean && (
          <section className="p-6 rounded-xl bg-cyber-card border border-cyber-border">
            <h2 className="text-xl font-bold mb-4">Detailed Findings</h2>
            <div className="space-y-4">
              {vulnerabilities.map((vuln: VulnerabilityDetail, i: number) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-cyber-bg/50 border border-cyber-border/50"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${severityColors[vuln.severity]} bg-white/5`}
                    >
                      {vuln.severity}
                    </span>
                    <span className="font-semibold">{vuln.title}</span>
                    {vuln.cwe_id && (
                      <span className="text-xs text-cyber-muted">{vuln.cwe_id}</span>
                    )}
                  </div>
                  <p className="text-sm text-cyber-muted mb-2">{vuln.description}</p>
                  {vuln.snippet && (
                    <pre className="p-2 rounded bg-black/30 text-xs font-mono text-red-300 overflow-x-auto">
                      {vuln.snippet}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Patch Summary */}
        {patchResult && (
          <section className="p-6 rounded-xl bg-cyber-card border border-cyber-border">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-cyber-green" />
              Patches Applied
            </h2>
            <div className="space-y-3">
              {patchResult.patches_applied.map((patch, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-cyber-green/5 border border-cyber-green/20"
                >
                  <CheckCircle2 size={16} className="text-cyber-green shrink-0" />
                  <span className="text-sm">{patch.description}</span>
                  <span className="text-xs text-cyber-muted ml-auto">{patch.rule_id}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Re-scan Summary */}
        {rescanResult && (
          <section className="p-6 rounded-xl bg-cyber-card border border-cyber-border">
            <h2 className="text-xl font-bold mb-4">Verification Results</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-red-900/10">
                <div className="text-2xl font-bold text-red-400">
                  {rescanResult.original_scan.summary.total}
                </div>
                <div className="text-xs text-cyber-muted">Original Issues</div>
              </div>
              <div className="p-4 rounded-lg bg-cyber-green/10">
                <div className="text-2xl font-bold text-cyber-green">
                  {rescanResult.vulnerabilities_fixed}
                </div>
                <div className="text-xs text-cyber-muted">Fixed</div>
              </div>
              <div className="p-4 rounded-lg bg-yellow-900/10">
                <div className="text-2xl font-bold text-yellow-400">
                  {rescanResult.vulnerabilities_remaining}
                </div>
                <div className="text-xs text-cyber-muted">Remaining</div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
