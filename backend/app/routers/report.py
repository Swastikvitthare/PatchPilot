"""Report generation API routes — PDF and JSON."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.models.schemas import ReportRequest
from app.scanners.engine import ScanEngine
from app.services.report_service import ReportService

logger = logging.getLogger("patchpilot.router.report")
router = APIRouter(prefix="/api/report", tags=["report"])

_report_service = ReportService()

# In-memory patch result cache — populated by the scan router on patch calls.
# We import the dict lazily so both routers can share state.
_patch_cache: dict[str, object] = {}


def _get_patch_result(scan_id: str):
    """Attempt to retrieve a cached PatchResult for *scan_id*."""
    return _patch_cache.get(scan_id)


# ------------------------------------------------------------------
# POST /api/report/pdf
# ------------------------------------------------------------------
@router.post("/pdf")
async def pdf_report(request: ReportRequest) -> Response:
    """Generate a PDF security report for a completed scan."""
    scan = ScanEngine.get_scan(request.scan_id)
    if scan is None:
        raise HTTPException(status_code=404, detail=f"Scan {request.scan_id} not found.")

    patch = _get_patch_result(request.scan_id) if request.include_patches else None

    pdf_bytes = _report_service.generate_pdf_report(scan, patch)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="patchpilot_report_{request.scan_id[:8]}.pdf"'
            )
        },
    )


# ------------------------------------------------------------------
# POST /api/report/json
# ------------------------------------------------------------------
@router.post("/json")
async def json_report(request: ReportRequest) -> dict:
    """Generate a JSON security report for a completed scan."""
    scan = ScanEngine.get_scan(request.scan_id)
    if scan is None:
        raise HTTPException(status_code=404, detail=f"Scan {request.scan_id} not found.")

    patch = _get_patch_result(request.scan_id) if request.include_patches else None

    return _report_service.generate_json_report(scan, patch)
