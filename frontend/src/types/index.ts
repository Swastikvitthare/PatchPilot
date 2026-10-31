export interface VulnerabilityDetail {
  rule_id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  line_number?: number;
  column?: number;
  snippet?: string;
  cwe_id?: string;
}

export interface ScanSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  total: number;
}

export interface ScanResult {
  scan_id: string;
  filename: string;
  language: string;
  vulnerabilities: VulnerabilityDetail[];
  scan_time: number;
  scanned_at: string;
  summary: ScanSummary;
}

export interface PatchResult {
  scan_id: string;
  original_code: string;
  patched_code: string;
  patches_applied: PatchApplied[];
  ai_explanation?: string;
}

export interface PatchApplied {
  rule_id: string;
  description: string;
  line_number?: number;
}

export interface RescanResult {
  original_scan: ScanResult;
  rescan: ScanResult;
  vulnerabilities_fixed: number;
  vulnerabilities_remaining: number;
}

export type AppView = 'landing' | 'scanner' | 'results' | 'patch' | 'report';
