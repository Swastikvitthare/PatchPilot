"""Hardcoded credentials / secrets scanner – regex-based."""

from __future__ import annotations

import re
import uuid

from app.models import Vulnerability
from app.scanners.base import BaseScanner

# ── Variable-name patterns that suggest secrets ─────────────────────────────
_SECRET_VAR_NAMES = re.compile(
    r"\b(?:password|passwd|pwd|secret|api_key|apikey|api_secret|"
    r"access_key|secret_key|private_key|token|auth_token|"
    r"access_token|refresh_token|session_key|db_password|"
    r"database_password|mysql_pwd|encryption_key|signing_key|"
    r"client_secret|app_secret)\b",
    re.IGNORECASE,
)

# ── Specific credential patterns ────────────────────────────────────────────
_CREDENTIAL_PATTERNS: list[tuple[re.Pattern[str], str, str]] = [
    # AWS Access Key ID
    (
        re.compile(r"(?<![A-Z0-9])(AKIA[0-9A-Z]{16})(?![A-Z0-9])"),
        "AWS Access Key ID detected",
        "high",
    ),
    # AWS Secret Access Key (40-char base64)
    (
        re.compile(r"""(?:aws_secret_access_key|secret_key)\s*[:=]\s*['"]?([A-Za-z0-9/+=]{40})['"]?""", re.IGNORECASE),
        "AWS Secret Access Key detected",
        "critical",
    ),
    # Generic long hex string assigned to key-like variable
    (
        re.compile(
            r"""(?:api[_-]?key|token|secret|password)\s*[:=]\s*['"]([0-9a-fA-F]{32,})['"]""",
            re.IGNORECASE,
        ),
        "Long hex string assigned to a secret-like variable",
        "high",
    ),
    # Generic long base64 string assigned to key-like variable
    (
        re.compile(
            r"""(?:api[_-]?key|token|secret|password)\s*[:=]\s*['"]([A-Za-z0-9+/=]{32,})['"]""",
            re.IGNORECASE,
        ),
        "Long base64 string assigned to a secret-like variable",
        "high",
    ),
    # Private key files (PEM header)
    (
        re.compile(r"-----BEGIN\s+(RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----"),
        "Private key content embedded in source code",
        "critical",
    ),
    # GitHub / GitLab / generic token patterns
    (
        re.compile(r"gh[pousr]_[A-Za-z0-9_]{36,}"),
        "GitHub personal access token detected",
        "critical",
    ),
    (
        re.compile(r"glpat-[A-Za-z0-9\-_]{20,}"),
        "GitLab personal access token detected",
        "critical",
    ),
]

# Pattern for simple assignment: var = "literal"
_ASSIGNMENT_RE = re.compile(
    r"""^[^#]*\b(\w+)\s*=\s*(['"])(.*?)\2""",
    re.MULTILINE,
)


class HardcodedCredsScanner(BaseScanner):
    """Detect hardcoded credentials, API keys, and secrets."""

    name = "hardcoded_creds"
    description = "Detects hardcoded passwords, API keys, tokens, and embedded private keys"

    def scan(self, code: str, filename: str = "<input>") -> list[Vulnerability]:
        vulns: list[Vulnerability] = []
        lines = code.splitlines()

        # ── Check variable assignments against secret-name patterns ──────
        for match in _ASSIGNMENT_RE.finditer(code):
            var_name = match.group(1)
            value = match.group(3)
            if _SECRET_VAR_NAMES.search(var_name) and len(value) >= 1:
                # Skip obviously safe placeholders
                if value.lower() in ("", "none", "null", "todo", "changeme", "xxx", "your_password_here"):
                    continue
                # Skip os.environ / os.getenv patterns (already safe)
                if "os.environ" in value or "os.getenv" in value:
                    continue

                line_no = code[: match.start()].count("\n") + 1
                snippet = lines[line_no - 1].strip() if line_no <= len(lines) else match.group(0)
                vulns.append(
                    Vulnerability(
                        id=uuid.uuid4().hex,
                        rule_id="CRED-001",
                        severity="high",
                        title="Hardcoded Credential",
                        description=f"Variable '{var_name}' appears to contain a hardcoded secret.",
                        file=filename,
                        line_start=line_no,
                        line_end=line_no,
                        code_snippet=snippet,
                        category="Hardcoded Credentials",
                        cwe_id="CWE-798",
                        recommendation=(
                            "Move secrets to environment variables or a secrets manager. "
                            "Use os.environ.get() or a .env file with python-dotenv."
                        ),
                    )
                )

        # ── Check specific credential patterns ──────────────────────────
        for line_no, line in enumerate(lines, start=1):
            for pattern, desc, severity in _CREDENTIAL_PATTERNS:
                if pattern.search(line):
                    vulns.append(
                        Vulnerability(
                            id=uuid.uuid4().hex,
                            rule_id="CRED-002",
                            severity=severity,
                            title="Embedded Secret / Key",
                            description=desc,
                            file=filename,
                            line_start=line_no,
                            line_end=line_no,
                            code_snippet=line.strip(),
                            category="Hardcoded Credentials",
                            cwe_id="CWE-798",
                            recommendation=(
                                "Remove the secret from source code. Use environment variables, "
                                "a vault service, or encrypted configuration files."
                            ),
                        )
                    )

        # Deduplicate by (line, rule_id)
        seen: set[tuple[int, str]] = set()
        unique: list[Vulnerability] = []
        for v in vulns:
            key = (v.line_start, v.rule_id)
            if key not in seen:
                seen.add(key)
                unique.append(v)

        return unique
