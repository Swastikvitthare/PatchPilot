"""Patch generator – AI-powered (Gemma 4) with rule-based fallback."""

from __future__ import annotations

import logging
import re

from app.models import Patch, Vulnerability
from app.services.gemma_client import gemma_client

logger = logging.getLogger(__name__)


class PatchGenerator:
    """Generate code patches for detected vulnerabilities."""

    async def generate_patches(
        self, code: str, vulnerabilities: list[Vulnerability]
    ) -> tuple[list[Patch], str]:
        """Return ``(patches, patched_full_code)``."""
        patches: list[Patch] = []
        patched_code = code

        for vuln in vulnerabilities:
            if gemma_client.is_available:
                patch = await self._ai_patch(code, vuln)
            else:
                patch = None

            if patch is None:
                patch = self._rule_based_patch(code, vuln)

            if patch is not None:
                patches.append(patch)
                # Apply the patch to the running copy of the code
                if patch.original_code and patch.patched_code:
                    patched_code = patched_code.replace(
                        patch.original_code, patch.patched_code, 1
                    )

        return patches, patched_code

    # ── AI-based patching ────────────────────────────────────────────────

    async def _ai_patch(self, code: str, vuln: Vulnerability) -> Patch | None:
        prompt = (
            f"The following Python code has a security vulnerability.\n\n"
            f"**Vulnerability:** {vuln.title}\n"
            f"**Description:** {vuln.description}\n"
            f"**CWE:** {vuln.cwe_id or 'N/A'}\n"
            f"**Line {vuln.line_start}:** `{vuln.code_snippet}`\n\n"
            f"**Full code:**\n```python\n{code}\n```\n\n"
            f"Respond in EXACTLY this format (no extra text):\n"
            f"ORIGINAL:\n```\n<exact original vulnerable line(s)>\n```\n"
            f"PATCHED:\n```\n<fixed replacement line(s)>\n```\n"
            f"EXPLANATION:\n<one-paragraph explanation>\n"
            f"CONFIDENCE: high|medium|low"
        )

        response = await gemma_client.generate(prompt)
        if not response:
            return None

        return self._parse_ai_response(response, vuln)

    @staticmethod
    def _parse_ai_response(text: str, vuln: Vulnerability) -> Patch | None:
        """Parse the structured AI response into a Patch object."""
        original_match = re.search(r"ORIGINAL:\s*```\s*\n?(.*?)```", text, re.DOTALL)
        patched_match = re.search(r"PATCHED:\s*```\s*\n?(.*?)```", text, re.DOTALL)
        explanation_match = re.search(r"EXPLANATION:\s*(.+?)(?=CONFIDENCE:|$)", text, re.DOTALL)
        confidence_match = re.search(r"CONFIDENCE:\s*(high|medium|low)", text, re.IGNORECASE)

        original = original_match.group(1).strip() if original_match else vuln.code_snippet
        patched = patched_match.group(1).strip() if patched_match else ""
        explanation = explanation_match.group(1).strip() if explanation_match else "AI-generated fix."
        confidence = confidence_match.group(1).lower() if confidence_match else "medium"

        if not patched:
            return None

        return Patch(
            vulnerability_id=vuln.id,
            original_code=original,
            patched_code=patched,
            explanation=explanation,
            confidence=confidence,
        )

    # ── Rule-based fallback patching ─────────────────────────────────────

    def _rule_based_patch(self, code: str, vuln: Vulnerability) -> Patch | None:
        """Generate a simple deterministic patch based on the vulnerability type."""
        snippet = vuln.code_snippet
        if not snippet:
            return None

        handler = self._RULE_HANDLERS.get(vuln.category)
        if handler:
            return handler(self, vuln, snippet)
        return self._generic_patch(vuln, snippet)

    def _patch_sql_injection(self, vuln: Vulnerability, snippet: str) -> Patch:
        """Replace string concatenation SQL with parameterized placeholder."""
        # Try to build a parameterised version
        patched = snippet
        # Replace f-string: f"SELECT ... {var}" → "SELECT ... %s", (var,)
        fstring_match = re.search(r"""f(['"])(.*?)\{(\w+)\}(.*?)\1""", snippet)
        if fstring_match:
            q = fstring_match.group(1)
            before = fstring_match.group(2)
            var = fstring_match.group(3)
            after = fstring_match.group(4)
            patched = f'{q}{before}%s{after}{q}, ({var},)'
        else:
            # Generic: add a comment recommending parameterised queries
            patched = f"# FIXED: Use parameterized query instead\n# {snippet}"

        return Patch(
            vulnerability_id=vuln.id,
            original_code=snippet,
            patched_code=patched,
            explanation="Replaced string interpolation with parameterized query placeholders to prevent SQL injection.",
            confidence="medium",
        )

    def _patch_hardcoded_creds(self, vuln: Vulnerability, snippet: str) -> Patch:
        """Replace hardcoded credential with os.environ.get()."""
        # Extract variable name
        var_match = re.match(r"(\w+)\s*=\s*['\"].*?['\"]", snippet)
        if var_match:
            var = var_match.group(1)
            patched = f'{var} = os.environ.get("{var.upper()}", "")'
        else:
            patched = f'# FIXED: Move to environment variable\n# {snippet}'

        return Patch(
            vulnerability_id=vuln.id,
            original_code=snippet,
            patched_code=patched,
            explanation="Replaced hardcoded credential with os.environ.get() to read the value from an environment variable.",
            confidence="high",
        )

    def _patch_dangerous_function(self, vuln: Vulnerability, snippet: str) -> Patch:
        """Replace dangerous function calls with safer alternatives."""
        patched = snippet

        if "eval(" in snippet:
            patched = snippet.replace("eval(", "ast.literal_eval(")
            explanation = "Replaced eval() with ast.literal_eval() which safely evaluates literals."
        elif "exec(" in snippet:
            patched = f"# SECURITY: exec() removed – refactor to avoid dynamic execution\n# {snippet}"
            explanation = "Commented out exec() call. Refactor to use a safer pattern."
        elif "os.system(" in snippet:
            cmd_match = re.search(r"os\.system\((.*)\)", snippet)
            cmd_arg = cmd_match.group(1) if cmd_match else "'cmd'"
            patched = f"subprocess.run({cmd_arg}, shell=False, check=True)"
            explanation = "Replaced os.system() with subprocess.run() without shell=True."
        elif "shell=True" in snippet:
            patched = snippet.replace("shell=True", "shell=False")
            explanation = "Changed shell=True to shell=False to prevent command injection."
        elif "pickle.loads" in snippet or "pickle.load" in snippet:
            patched = snippet.replace("pickle.loads", "json.loads").replace("pickle.load", "json.load")
            explanation = "Replaced pickle deserialization with JSON for safe data handling."
        elif "__import__(" in snippet:
            mod_match = re.search(r"__import__\(['\"](\w+)['\"]\)", snippet)
            mod_name = mod_match.group(1) if mod_match else "module"
            patched = f"importlib.import_module('{mod_name}')"
            explanation = "Replaced __import__() with importlib.import_module()."
        else:
            patched = f"# SECURITY: Review and fix the following line\n# {snippet}"
            explanation = "Flagged for manual review."

        return Patch(
            vulnerability_id=vuln.id,
            original_code=snippet,
            patched_code=patched,
            explanation=explanation,
            confidence="medium",
        )

    def _patch_static_analysis(self, vuln: Vulnerability, snippet: str) -> Patch:
        """Handle static analysis findings."""
        patched = snippet
        explanation = "Applied rule-based fix."

        if "debug=True" in snippet:
            patched = snippet.replace("debug=True", "debug=False")
            explanation = "Disabled debug mode for production safety."
        elif "0.0.0.0" in snippet:
            patched = snippet.replace("0.0.0.0", "127.0.0.1")
            explanation = "Changed binding from 0.0.0.0 to 127.0.0.1 for local-only access."
        elif "random." in snippet:
            patched = snippet.replace("random.", "secrets.")
            explanation = "Replaced insecure random module with cryptographically secure secrets module."
        elif snippet.strip().startswith("assert"):
            condition = snippet.strip()[len("assert"):].strip()
            patched = f"if not ({condition}):\n    raise PermissionError('Access denied')"
            explanation = "Replaced assert (removed with -O) with explicit if-check that raises an exception."
        elif "csrf_exempt" in snippet:
            patched = f"# SECURITY: CSRF protection should be enabled\n# {snippet}"
            explanation = "Flagged csrf_exempt decorator for removal."
        elif "import pickle" in snippet or "import marshal" in snippet or "import shelve" in snippet:
            patched = f"# SECURITY: Consider using json instead\nimport json"
            explanation = "Replaced dangerous serialization import with json."
        else:
            patched = f"# SECURITY: Review this line\n# {snippet}"
            explanation = "Flagged for manual security review."

        return Patch(
            vulnerability_id=vuln.id,
            original_code=snippet,
            patched_code=patched,
            explanation=explanation,
            confidence="medium",
        )

    def _generic_patch(self, vuln: Vulnerability, snippet: str) -> Patch:
        return Patch(
            vulnerability_id=vuln.id,
            original_code=snippet,
            patched_code=f"# SECURITY: {vuln.title} – review needed\n# {snippet}",
            explanation=f"{vuln.recommendation}",
            confidence="low",
        )

    _RULE_HANDLERS: dict[str, object] = {
        "SQL Injection": _patch_sql_injection,
        "Hardcoded Credentials": _patch_hardcoded_creds,
        "Dangerous Function Call": _patch_dangerous_function,
        "Static Analysis": _patch_static_analysis,
    }


# Module-level singleton
patch_generator = PatchGenerator()
