"""Unsafe eval / exec / os.system / subprocess scanner – AST-based."""

from __future__ import annotations

import ast
import uuid

from app.models import Vulnerability
from app.scanners.base import BaseScanner

# Mapping of dangerous function → (rule_id, severity, title, cwe, recommendation)
_DANGEROUS_CALLS: dict[str, tuple[str, str, str, str, str]] = {
    "eval": (
        "EVAL-001",
        "critical",
        "Use of eval()",
        "CWE-95",
        "Replace eval() with ast.literal_eval() for data parsing, or refactor to avoid dynamic code execution entirely.",
    ),
    "exec": (
        "EVAL-002",
        "critical",
        "Use of exec()",
        "CWE-95",
        "Remove exec() usage. If dynamic behaviour is needed, use a safe dispatch table or plugin architecture.",
    ),
    "compile": (
        "EVAL-003",
        "high",
        "Use of compile()",
        "CWE-95",
        "Avoid compile() with untrusted input. If used for template engines, ensure input is validated.",
    ),
    "__import__": (
        "EVAL-004",
        "high",
        "Use of __import__()",
        "CWE-95",
        "Use importlib.import_module() with a whitelist of allowed modules instead of __import__().",
    ),
}


class UnsafeEvalScanner(BaseScanner):
    """Detect eval, exec, compile, os.system, subprocess shell=True, pickle.loads, __import__."""

    name = "unsafe_eval"
    description = "Detects dangerous dynamic code execution and command injection patterns"

    def scan(self, code: str, filename: str = "<input>") -> list[Vulnerability]:
        vulns: list[Vulnerability] = []
        lines = code.splitlines()

        try:
            tree = ast.parse(code, filename=filename)
        except SyntaxError:
            return vulns

        for node in ast.walk(tree):
            if not isinstance(node, ast.Call):
                continue

            func_name = self._resolve_call_name(node)
            if func_name is None:
                continue

            line_no = getattr(node, "lineno", 1)
            snippet = lines[line_no - 1].strip() if line_no <= len(lines) else ""

            # ── Direct dangerous builtins ────────────────────────────────
            base_name = func_name.split(".")[-1]
            if base_name in _DANGEROUS_CALLS:
                rule_id, severity, title, cwe, rec = _DANGEROUS_CALLS[base_name]
                vulns.append(
                    self._vuln(rule_id, severity, title, f"Call to {func_name}() detected.", cwe, rec, snippet, line_no, filename)
                )
                continue

            # ── os.system ────────────────────────────────────────────────
            if func_name in ("os.system", "system") or func_name.endswith(".system"):
                if func_name == "system" or "os" in func_name:
                    vulns.append(
                        self._vuln(
                            "CMD-001",
                            "critical",
                            "Use of os.system()",
                            "os.system() executes shell commands and is vulnerable to command injection.",
                            "CWE-78",
                            "Use subprocess.run() with a list of arguments (no shell=True) and validate all inputs.",
                            snippet,
                            line_no,
                            filename,
                        )
                    )
                    continue

            # ── subprocess with shell=True ───────────────────────────────
            if func_name in (
                "subprocess.call",
                "subprocess.run",
                "subprocess.Popen",
                "subprocess.check_output",
                "subprocess.check_call",
            ) or func_name.startswith("subprocess."):
                if self._has_shell_true(node):
                    vulns.append(
                        self._vuln(
                            "CMD-002",
                            "high",
                            "subprocess with shell=True",
                            f"Call to {func_name}() with shell=True is vulnerable to command injection.",
                            "CWE-78",
                            "Pass commands as a list without shell=True: subprocess.run(['cmd', 'arg1', 'arg2']).",
                            snippet,
                            line_no,
                            filename,
                        )
                    )
                    continue

            # ── pickle.loads ─────────────────────────────────────────────
            if func_name in ("pickle.loads", "pickle.load", "cPickle.loads", "cPickle.load"):
                vulns.append(
                    self._vuln(
                        "DESER-001",
                        "critical",
                        "Unsafe Deserialization (pickle)",
                        f"Call to {func_name}() can execute arbitrary code when deserializing untrusted data.",
                        "CWE-502",
                        "Use safe serialization formats like JSON. If pickle is required, only deserialize trusted data and consider using hmac verification.",
                        snippet,
                        line_no,
                        filename,
                    )
                )
                continue

        return vulns

    # ── helpers ──────────────────────────────────────────────────────────

    @staticmethod
    def _resolve_call_name(node: ast.Call) -> str | None:
        """Return the dotted name of the called function, or None."""
        func = node.func
        if isinstance(func, ast.Name):
            return func.id
        if isinstance(func, ast.Attribute):
            parts: list[str] = [func.attr]
            current = func.value
            while isinstance(current, ast.Attribute):
                parts.append(current.attr)
                current = current.value
            if isinstance(current, ast.Name):
                parts.append(current.id)
            return ".".join(reversed(parts))
        return None

    @staticmethod
    def _has_shell_true(node: ast.Call) -> bool:
        """Return True if the call has a ``shell=True`` keyword argument."""
        for kw in node.keywords:
            if kw.arg == "shell":
                if isinstance(kw.value, ast.Constant) and kw.value.value is True:
                    return True
                if isinstance(kw.value, ast.NameConstant) and getattr(kw.value, "value", None) is True:
                    return True
        return False

    @staticmethod
    def _vuln(
        rule_id: str,
        severity: str,
        title: str,
        description: str,
        cwe_id: str,
        recommendation: str,
        snippet: str,
        line: int,
        filename: str,
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
            category="Dangerous Function Call",
            cwe_id=cwe_id,
            recommendation=recommendation,
        )
