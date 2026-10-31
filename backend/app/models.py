"""Pydantic v2 models shared across the PatchPilot backend."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


# ── Vulnerability ────────────────────────────────────────────────────────────


class Vulnerability(BaseModel):
    """A single security finding detected by a scanner."""

    id: str = Field(..., description="Unique identifier for this finding (uuid4 hex)")
    rule_id: str = Field(..., description="Scanner rule that triggered, e.g. SQL-INJ-001")
    severity: str = Field(..., description="critical | high | medium | low | info")
    title: str
    description: str
    file: str = Field(default="<input>", description="Filename of the scanned code")
    line_start: int = Field(ge=1)
    line_end: int = Field(ge=1)
    code_snippet: str = Field(default="")
    category: str = Field(..., description="Vulnerability category, e.g. SQL Injection")
    cwe_id: Optional[str] = Field(default=None, description="CWE identifier, e.g. CWE-89")
    recommendation: str = Field(default="")


# ── Scan ─────────────────────────────────────────────────────────────────────


class ScanRequest(BaseModel):
    """Inbound request to scan source code."""

    code: str
    language: str = "python"
    filename: Optional[str] = None


class ScanResult(BaseModel):
    """Aggregated scan output returned to the client."""

    scan_id: str
    vulnerabilities: list[Vulnerability] = []
    summary: dict[str, int] = Field(
        default_factory=lambda: {
            "total": 0,
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0,
            "info": 0,
        }
    )
    scanned_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    language: str = "python"
    filename: Optional[str] = None


# ── Patch ────────────────────────────────────────────────────────────────────


class PatchRequest(BaseModel):
    """Request to generate patches for detected vulnerabilities."""

    code: str
    vulnerabilities: list[Vulnerability]
    scan_id: str


class Patch(BaseModel):
    """A single suggested code patch."""

    vulnerability_id: str
    original_code: str
    patched_code: str
    explanation: str
    confidence: str = Field(default="medium", description="high | medium | low")


class PatchResult(BaseModel):
    """Full patching response."""

    scan_id: str
    patches: list[Patch] = []
    patched_code_full: str = ""
    ai_available: bool = False


# ── Rescan ───────────────────────────────────────────────────────────────────


class RescanRequest(BaseModel):
    """Request to rescan (typically the patched code)."""

    code: str
    language: str = "python"


# ── Report ───────────────────────────────────────────────────────────────────


class ReportRequest(BaseModel):
    """Request to generate a PDF report."""

    scan_id: str
    original_code: str
    patched_code: Optional[str] = None
    vulnerabilities: list[Vulnerability]
    patches: Optional[list[Patch]] = None


# ── Health ───────────────────────────────────────────────────────────────────


class HealthResponse(BaseModel):
    """GET /api/health response."""

    status: str = "ok"
    version: str = "1.0.0"
    ai_available: bool = False
    scanners_available: list[str] = []
