"""Scan engine – orchestrates all registered scanners."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.models import ScanResult, Vulnerability
from app.scanners.base import BaseScanner
from app.scanners.hardcoded_creds import HardcodedCredsScanner
from app.scanners.python_static import PythonStaticScanner
from app.scanners.sql_injection import SQLInjectionScanner
from app.scanners.unsafe_eval import UnsafeEvalScanner


class ScanEngine:
    """Registers all scanners and aggregates their results."""

    def __init__(self) -> None:
        self._scanners: list[BaseScanner] = [
            SQLInjectionScanner(),
            HardcodedCredsScanner(),
            UnsafeEvalScanner(),
            PythonStaticScanner(),
        ]

    @property
    def scanner_names(self) -> list[str]:
        return [s.name for s in self._scanners]

    def run_scan(self, code: str, language: str = "python", filename: str = "<input>") -> ScanResult:
        """Run every registered scanner against *code* and return an aggregated result."""
        all_vulns: list[Vulnerability] = []

        for scanner in self._scanners:
            try:
                findings = scanner.scan(code, filename=filename)
                all_vulns.extend(findings)
            except Exception:
                # Gracefully skip failing scanners so the rest still report
                continue

        # Compute summary counts
        summary = {"total": 0, "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
        for v in all_vulns:
            sev = v.severity.lower()
            if sev in summary:
                summary[sev] += 1
            summary["total"] += 1

        return ScanResult(
            scan_id=uuid.uuid4().hex,
            vulnerabilities=all_vulns,
            summary=summary,
            scanned_at=datetime.now(timezone.utc).isoformat(),
            language=language,
            filename=filename,
        )


# Module-level singleton
scan_engine = ScanEngine()
