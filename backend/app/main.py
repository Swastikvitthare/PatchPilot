"""PATCHPILOT — FastAPI application entry point."""

from __future__ import annotations

import logging
import sys

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.scan import router as scan_router
from app.routers.report import router as report_router

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger("patchpilot")

app = FastAPI(
    title="PATCHPILOT",
    description="AI-powered cybersecurity code scanner and auto-patcher",
    version="1.0.0",
)

# ------------------------------------------------------------------
# CORS — allow everything during development
# ------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------
# Routers
# ------------------------------------------------------------------
app.include_router(scan_router)
app.include_router(report_router)


# ------------------------------------------------------------------
# Health check
# ------------------------------------------------------------------
@app.get("/api/health", tags=["health"])
async def health_check() -> dict:
    """Return service health status."""
    return {
        "status": "healthy",
        "service": "patchpilot",
        "version": "1.0.0",
    }


# ------------------------------------------------------------------
# Startup banner
# ------------------------------------------------------------------
@app.on_event("startup")
async def startup_banner() -> None:
    banner = r"""
    ╔═══════════════════════════════════════════════════╗
    ║            ____       _       _     ____  _ _     ║
    ║           |  _ \ __ _| |_ ___| |__ |  _ \(_) |   ║
    ║           | |_) / _` | __/ __| '_ \| |_) | | |   ║
    ║           |  __/ (_| | || (__| | | |  __/| | |   ║
    ║           |_|   \__,_|\__\___|_| |_|_|   |_|_|   ║
    ║                                                   ║
    ║       AI-Powered Security Scanner & Patcher       ║
    ╚═══════════════════════════════════════════════════╝
    """
    logger.info(banner)
    logger.info("PATCHPILOT backend is up and running.")
