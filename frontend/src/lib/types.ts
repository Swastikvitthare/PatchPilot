// ─── Core Types ──────────────────────────────────────────────────────────────

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Vulnerability {
  id: string;
  rule_id: string;
  severity: Severity;
  title: string;
  description: string;
  file: string;
  line_start: number;
  line_end: number;
  code_snippet: string;
  category: string;
  cwe_id?: string;
  recommendation: string;
}

export interface ScanRequest {
  code: string;
  language: string;
  filename?: string;
}

export interface ScanSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export interface ScanResult {
  scan_id: string;
  vulnerabilities: Vulnerability[];
  summary: ScanSummary;
  scanned_at: string;
  language: string;
  filename: string;
}

export interface PatchRequest {
  code: string;
  vulnerabilities: Vulnerability[];
  scan_id: string;
}

export interface Patch {
  vulnerability_id: string;
  original_code: string;
  patched_code: string;
  explanation: string;
  confidence: number;
}

export interface PatchResult {
  scan_id: string;
  patches: Patch[];
  patched_code: string;
  summary: {
    total_vulnerabilities: number;
    patches_generated: number;
    average_confidence: number;
  };
}

export interface RescanRequest {
  code: string;
  language: string;
}

export interface ReportRequest {
  scan_id: string;
  original_code: string;
  patched_code?: string;
  vulnerabilities: Vulnerability[];
  patches?: Patch[];
}

export interface HealthResponse {
  status: string;
  version?: string;
  uptime?: number;
}

// ─── UI State Types ──────────────────────────────────────────────────────────

export type ScanStatus = "idle" | "scanning" | "complete" | "error";
export type PatchStatus = "idle" | "patching" | "complete" | "error";

export interface StoredScan {
  scanResult: ScanResult;
  code: string;
  language: string;
  timestamp: string;
}

export interface StoredPatch {
  patchResult: PatchResult;
  scanResult: ScanResult;
  originalCode: string;
  timestamp: string;
}
