"""Utility helpers: input validation, language detection, filename sanitization."""

from __future__ import annotations

import os
import re

from fastapi import HTTPException, status


def validate_code_size(code: str, max_kb: int) -> None:
    """Raise 413 if *code* exceeds *max_kb* kilobytes."""
    size_kb = len(code.encode("utf-8")) / 1024
    if size_kb > max_kb:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Code size ({size_kb:.1f} KB) exceeds maximum allowed ({max_kb} KB).",
        )


def detect_language(code: str, filename: str | None = None) -> str:
    """Return the detected language string (currently only ``'python'``)."""
    if filename:
        ext = os.path.splitext(filename)[1].lower()
        ext_map: dict[str, str] = {
            ".py": "python",
            ".pyw": "python",
            ".js": "javascript",
            ".ts": "typescript",
            ".java": "java",
            ".go": "go",
            ".rb": "ruby",
            ".rs": "rust",
            ".c": "c",
            ".cpp": "cpp",
            ".cs": "csharp",
        }
        if ext in ext_map:
            return ext_map[ext]

    # Content-based heuristics for Python
    python_indicators = [
        r"^\s*import\s+\w+",
        r"^\s*from\s+\w+\s+import",
        r"^\s*def\s+\w+\s*\(",
        r"^\s*class\s+\w+",
        r"^\s*if\s+__name__\s*==",
        r"#!/usr/bin/(env\s+)?python",
    ]
    for pattern in python_indicators:
        if re.search(pattern, code, re.MULTILINE):
            return "python"

    return "python"  # default fallback


def sanitize_filename(filename: str | None) -> str:
    """Strip path traversal and dangerous characters from a filename."""
    if not filename:
        return "untitled.py"

    # Take only the basename
    name = os.path.basename(filename)

    # Remove path traversal patterns
    name = name.replace("..", "").replace("/", "").replace("\\", "")

    # Strip null bytes and control characters
    name = re.sub(r"[\x00-\x1f]", "", name)

    if not name:
        return "untitled.py"

    return name
