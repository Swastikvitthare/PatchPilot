import {
  ScanResult,
  PatchResult,
  ScanResult as ScanResultType,
  ReportRequest,
  Vulnerability,
  HealthResponse,
} from "./types";

const API_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api");

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let message = `API request failed: ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.json();
      if (errorBody.detail) message = errorBody.detail;
      else if (errorBody.message) message = errorBody.message;
    } catch {
      // use default message
    }
    throw new ApiError(message, response.status);
  }

  return response.json();
}

// ─── Scan ────────────────────────────────────────────────────────────────────

export async function scanCode(
  code: string,
  language: string,
  filename?: string
): Promise<ScanResult> {
  return request<ScanResult>("/scan", {
    method: "POST",
    body: JSON.stringify({ code, language, filename }),
  });
}

// ─── Patch ───────────────────────────────────────────────────────────────────

export async function generatePatches(
  code: string,
  vulnerabilities: Vulnerability[],
  scanId: string
): Promise<PatchResult> {
  return request<PatchResult>("/patch", {
    method: "POST",
    body: JSON.stringify({
      code,
      vulnerabilities,
      scan_id: scanId,
    }),
  });
}

// ─── Rescan ──────────────────────────────────────────────────────────────────

export async function rescanCode(
  code: string,
  language: string
): Promise<ScanResultType> {
  return request<ScanResultType>("/rescan", {
    method: "POST",
    body: JSON.stringify({ code, language }),
  });
}

// ─── Report ──────────────────────────────────────────────────────────────────

export async function generateReport(
  reportRequest: ReportRequest
): Promise<Blob> {
  const url = `${API_URL}/report`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reportRequest),
  });

  if (!response.ok) {
    let message = `Report generation failed: ${response.status}`;
    try {
      const errorBody = await response.json();
      if (errorBody.detail) message = errorBody.detail;
    } catch {
      // use default
    }
    throw new ApiError(message, response.status);
  }

  return response.blob();
}

// ─── Health ──────────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/health", { method: "GET" });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export { ApiError };
