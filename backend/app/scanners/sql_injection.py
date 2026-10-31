"""SQL Injection scanner – regex + AST analysis."""

from __future__ import annotations

import ast
import re
import uuid

from app.models import Vulnerability
from app.scanners.base import BaseScanner

# SQL keywords that start a dangerous statement
_SQL_KW = r"(?:SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|TRUNCATE|MERGE|EXEC|EXECUTE)"

# Patterns for string-concatenation SQL injection
_CONCAT_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    # "SELECT ... " + variable
    (
        re.compile(
            rf"""(['"])\s*{_SQL_KW}\b[^'"]*\1\s*\+""",
            re.IGNORECASE | re.DOTALL,
        ),
        "String concatenation in SQL query (+ operator)",
    ),
    # variable + "... SELECT ..."
    (
        re.compile(
            rf"""\+\s*(['"])\s*{_SQL_KW}\b""",
            re.IGNORECASE | re.DOTALL,
        ),
        "String concatenation in SQL query (+ operator, reversed)",
    ),
    # f-string with SQL keywords: f"SELECT ... {var} ..."
    (
        re.compile(
            rf"""f(['"])\s*{_SQL_KW}\b[^'"]*\{{[^}}]+\}}""",
            re.IGNORECASE | re.DOTALL,
        ),
        "f-string interpolation in SQL query",
    ),
    # .format() with SQL keywords
    (
        re.compile(
            rf"""(['"])\s*{_SQL_KW}\b[^'"]*(?:\{{\w*\}})[^'"]*\1\s*\.format\s*\(""",
            re.IGNORECASE | re.DOTALL,
        ),
        ".format() interpolation in SQL query",
    ),
    # %-formatting: "SELECT ... %s ..." % var
    (
        re.compile(
            rf"""(['"])\s*{_SQL_KW}\b[^'"]*%[sd][^'"]*\1\s*%\s*""",
            re.IGNORECASE | re.DOTALL,
        ),
        "%-formatting in SQL query",
    ),
]


class SQLInjectionScanner(BaseScanner):
    """Detect potential SQL injection vulnerabilities using regex and AST."""

    name = "sql_injection"
    description = "Detects SQL injection via string interpolation/concatenation in queries"

    def scan(self, code: str, filename: str = "<input>") -> list[Vulnerability]:
        vulns: list[Vulnerability] = []
        lines = code.splitlines()

        # ── Regex-based detection ────────────────────────────────────────
        for line_no, line in enumerate(lines, start=1):
            for pattern, desc in _CONCAT_PATTERNS:
                if pattern.search(line):
                    vulns.append(self._make_vuln(desc, line.strip(), line_no, filename))
                    break  # one finding per line

        # ── AST-based detection ──────────────────────────────────────────
        try:
            tree = ast.parse(code, filename=filename)
        except SyntaxError:
            return vulns

        for node in ast.walk(tree):
            # Detect cursor.execute("SELECT ..." + var)
            if isinstance(node, ast.Call):
                func = node.func
                if isinstance(func, ast.Attribute) and func.attr == "execute":
                    if node.args:
                        first_arg = node.args[0]
                        if self._is_string_concat_sql(first_arg, code):
                            line_no = getattr(node, "lineno", 1)
                            snippet = lines[line_no - 1].strip() if line_no <= len(lines) else ""
                            vulns.append(
                                self._make_vuln(
                                    "SQL query built with string concatenation passed to execute()",
                                    snippet,
                                    line_no,
                                    filename,
                                )
                            )

            # Detect f-string JoinedStr in assignments containing SQL keywords
            if isinstance(node, ast.Assign):
                if isinstance(node.value, ast.JoinedStr):
                    rendered = ast.get_source_segment(code, node.value) or ""
                    if re.search(_SQL_KW, rendered, re.IGNORECASE):
                        line_no = getattr(node, "lineno", 1)
                        snippet = lines[line_no - 1].strip() if line_no <= len(lines) else ""
                        vulns.append(
                            self._make_vuln(
                                "f-string SQL query assigned to variable",
                                snippet,
                                line_no,
                                filename,
                            )
                        )

        # Deduplicate by line number
        seen_lines: set[int] = set()
        unique: list[Vulnerability] = []
        for v in vulns:
            if v.line_start not in seen_lines:
                seen_lines.add(v.line_start)
                unique.append(v)

        return unique

    # ── helpers ──────────────────────────────────────────────────────────

    @staticmethod
    def _is_string_concat_sql(node: ast.AST, code: str) -> bool:
        """Return True if *node* looks like ``"SQL ..." + expr`` or ``f"SQL...{x}"``."""
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
            left_src = ast.get_source_segment(code, node.left) or ""
            right_src = ast.get_source_segment(code, node.right) or ""
            combined = left_src + right_src
            if re.search(_SQL_KW, combined, re.IGNORECASE):
                return True
        if isinstance(node, ast.JoinedStr):
            rendered = ast.get_source_segment(code, node) or ""
            if re.search(_SQL_KW, rendered, re.IGNORECASE):
                return True
        return False

    @staticmethod
    def _make_vuln(description: str, snippet: str, line: int, filename: str) -> Vulnerability:
        return Vulnerability(
            id=uuid.uuid4().hex,
            rule_id="SQL-INJ-001",
            severity="high",
            title="Potential SQL Injection",
            description=description,
            file=filename,
            line_start=line,
            line_end=line,
            code_snippet=snippet,
            category="SQL Injection",
            cwe_id="CWE-89",
            recommendation=(
                "Use parameterized queries (placeholders) instead of string "
                "concatenation or interpolation. For example, use "
                "cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))."
            ),
        )
