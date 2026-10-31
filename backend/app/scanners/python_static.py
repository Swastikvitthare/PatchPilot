"""Python static analysis scanner – AST-based detection of common misconfigurations."""

from __future__ import annotations

import ast
import uuid

from app.models import Vulnerability
from app.scanners.base import BaseScanner

_DANGEROUS_MODULES = {"pickle", "cPickle", "marshal", "shelve"}


class PythonStaticScanner(BaseScanner):
    """Detect insecure patterns: dangerous imports, debug=True, 0.0.0.0 binding,
    insecure random, assert for security, missing CSRF indicators.
    """

    name = "python_static"
    description = "General Python static analysis for insecure patterns and misconfigurations"

    def scan(self, code: str, filename: str = "<input>") -> list[Vulnerability]:
        vulns: list[Vulnerability] = []
        lines = code.splitlines()

        try:
            tree = ast.parse(code, filename=filename)
        except SyntaxError:
            return vulns

        for node in ast.walk(tree):
            # ── Dangerous module imports ─────────────────────────────────
            if isinstance(node, ast.Import):
                for alias in node.names:
                    mod = alias.name.split(".")[0]
                    if mod in _DANGEROUS_MODULES:
                        vulns.append(self._vuln(
                            "STATIC-001", "medium",
                            f"Import of dangerous module '{mod}'",
                            f"The '{mod}' module can execute arbitrary code during deserialization. "
                            "Only use it with fully trusted data.",
                            "CWE-502",
                            f"Replace '{mod}' with a safe serialization format like JSON where possible.",
                            self._snippet(lines, node), node.lineno, filename,
                        ))

            if isinstance(node, ast.ImportFrom) and node.module:
                mod = node.module.split(".")[0]
                if mod in _DANGEROUS_MODULES:
                    vulns.append(self._vuln(
                        "STATIC-001", "medium",
                        f"Import from dangerous module '{mod}'",
                        f"The '{mod}' module can execute arbitrary code during deserialization.",
                        "CWE-502",
                        f"Replace '{mod}' with a safe serialization format like JSON where possible.",
                        self._snippet(lines, node), node.lineno, filename,
                    ))

            # ── Flask/Django debug=True ──────────────────────────────────
            if isinstance(node, ast.Call):
                func_name = self._resolve_name(node.func)

                # app.run(debug=True)
                if func_name and func_name.endswith(".run"):
                    for kw in node.keywords:
                        if kw.arg == "debug" and self._is_true(kw.value):
                            vulns.append(self._vuln(
                                "STATIC-002", "high",
                                "Debug mode enabled",
                                "Running the application with debug=True in production exposes "
                                "the debugger and leaks sensitive information.",
                                "CWE-215",
                                "Set debug=False for production deployments. Use environment variables "
                                "to control debug mode.",
                                self._snippet(lines, node), node.lineno, filename,
                            ))

                # ── Binding to 0.0.0.0 ──────────────────────────────────
                if func_name and func_name.endswith(".run"):
                    for kw in node.keywords:
                        if kw.arg == "host":
                            if isinstance(kw.value, ast.Constant) and kw.value.value == "0.0.0.0":
                                vulns.append(self._vuln(
                                    "STATIC-003", "medium",
                                    "Binding to 0.0.0.0",
                                    "Binding to 0.0.0.0 makes the server accessible on all network "
                                    "interfaces, which may be unsafe in production.",
                                    "CWE-668",
                                    "Bind to 127.0.0.1 for local development. Use a reverse proxy "
                                    "(nginx, etc.) in production.",
                                    self._snippet(lines, node), node.lineno, filename,
                                ))

                # ── Insecure random ──────────────────────────────────────
                if func_name in (
                    "random.random", "random.randint", "random.choice",
                    "random.randrange", "random.uniform", "random.sample",
                ):
                    vulns.append(self._vuln(
                        "STATIC-004", "medium",
                        "Insecure random number generator",
                        f"'{func_name}' is not cryptographically secure. Do not use for "
                        "security-sensitive operations like tokens, passwords, or keys.",
                        "CWE-330",
                        "Use the 'secrets' module (secrets.token_hex(), secrets.token_urlsafe()) "
                        "for security-sensitive random values.",
                        self._snippet(lines, node), node.lineno, filename,
                    ))

            # ── Assert used for security checks ─────────────────────────
            if isinstance(node, ast.Assert):
                test_src = ast.dump(node.test)
                security_indicators = [
                    "auth", "permission", "role", "admin", "allowed",
                    "is_authenticated", "has_permission", "is_admin",
                    "is_authorized", "check_access", "verified",
                ]
                if any(ind in test_src.lower() for ind in security_indicators):
                    vulns.append(self._vuln(
                        "STATIC-005", "high",
                        "Assert used for security check",
                        "assert statements are removed when Python runs with -O (optimize). "
                        "Never use assert for access control or security validation.",
                        "CWE-617",
                        "Replace assert with explicit if-checks that raise appropriate exceptions.",
                        self._snippet(lines, node), node.lineno, filename,
                    ))

            # ── CSRF: Django views without csrf_exempt detection ─────────
            if isinstance(node, ast.FunctionDef):
                for decorator in node.decorator_list:
                    dec_name = self._resolve_name(decorator)
                    if dec_name and "csrf_exempt" in dec_name:
                        vulns.append(self._vuln(
                            "STATIC-006", "high",
                            "CSRF protection disabled",
                            f"The view '{node.name}' has CSRF protection disabled via @csrf_exempt.",
                            "CWE-352",
                            "Remove @csrf_exempt unless absolutely necessary. Implement proper "
                            "CSRF token handling for the endpoint.",
                            self._snippet(lines, node), node.lineno, filename,
                        ))

        return vulns

    # ── helpers ──────────────────────────────────────────────────────────

    @staticmethod
    def _resolve_name(node: ast.AST) -> str | None:
        if isinstance(node, ast.Name):
            return node.id
        if isinstance(node, ast.Attribute):
            parts = [node.attr]
            cur = node.value
            while isinstance(cur, ast.Attribute):
                parts.append(cur.attr)
                cur = cur.value
            if isinstance(cur, ast.Name):
                parts.append(cur.id)
            return ".".join(reversed(parts))
        return None

    @staticmethod
    def _is_true(node: ast.AST) -> bool:
        if isinstance(node, ast.Constant):
            return node.value is True
        return False

    @staticmethod
    def _snippet(lines: list[str], node: ast.AST) -> str:
        lineno = getattr(node, "lineno", 1)
        return lines[lineno - 1].strip() if lineno <= len(lines) else ""

    @staticmethod
    def _vuln(
        rule_id: str, severity: str, title: str, description: str,
        cwe_id: str, recommendation: str, snippet: str, line: int, filename: str,
    ) -> Vulnerability:
        return Vulnerability(
            id=uuid.uuid4().hex,
            rule_id=rule_id,
            severity=severity,
            title=title,
            description=description,
            file=filename,
            line_start=line,
            line_end=line,
            code_snippet=snippet,
            category="Static Analysis",
            cwe_id=cwe_id,
            recommendation=recommendation,
        )
