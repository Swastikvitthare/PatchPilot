"""PDF report generator using ReportLab."""

from __future__ import annotations

import io
import textwrap
from datetime import datetime, timezone

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
    Preformatted,
    PageBreak,
    HRFlowable,
)

from app.models import Patch, Vulnerability

_WIDTH, _HEIGHT = A4
_MARGIN = 25 * mm

# Colour palette
_BRAND_BLUE = colors.HexColor("#1e40af")
_BRAND_LIGHT = colors.HexColor("#dbeafe")
_SEVERITY_COLORS = {
    "critical": colors.HexColor("#dc2626"),
    "high": colors.HexColor("#ea580c"),
    "medium": colors.HexColor("#ca8a04"),
    "low": colors.HexColor("#2563eb"),
    "info": colors.HexColor("#6b7280"),
}


def _severity_color(sev: str) -> colors.Color:
    return _SEVERITY_COLORS.get(sev.lower(), colors.grey)


class ReportGenerator:
    """Generate a professional PDF security report."""

    def generate_pdf(
        self,
        scan_id: str,
        original_code: str,
        patched_code: str | None,
        vulnerabilities: list[Vulnerability],
        patches: list[Patch] | None,
    ) -> bytes:
        """Return the PDF as raw bytes."""
        buf = io.BytesIO()
        doc = SimpleDocTemplate(
            buf,
            pagesize=A4,
            leftMargin=_MARGIN,
            rightMargin=_MARGIN,
            topMargin=_MARGIN,
            bottomMargin=_MARGIN,
            title="PatchPilot Security Report",
            author="PatchPilot",
        )

        styles = getSampleStyleSheet()
        self._register_custom_styles(styles)

        story: list = []

        # ── Title page ───────────────────────────────────────────────────
        story.append(Spacer(1, 80))
        story.append(Paragraph("PATCHPILOT", styles["ReportTitle"]))
        story.append(Spacer(1, 10))
        story.append(Paragraph("Security Analysis Report", styles["ReportSubtitle"]))
        story.append(Spacer(1, 40))
        story.append(HRFlowable(width="80%", color=_BRAND_BLUE, thickness=2))
        story.append(Spacer(1, 20))

        now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        meta_data = [
            ["Scan ID:", scan_id],
            ["Generated:", now],
            ["Total Findings:", str(len(vulnerabilities))],
        ]
        meta_table = Table(meta_data, colWidths=[120, 350])
        meta_table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 11),
            ("TEXTCOLOR", (0, 0), (-1, -1), colors.black),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(meta_table)
        story.append(PageBreak())

        # ── Executive Summary ────────────────────────────────────────────
        story.append(Paragraph("Executive Summary", styles["Heading1"]))
        story.append(Spacer(1, 10))

        severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
        for v in vulnerabilities:
            sev = v.severity.lower()
            if sev in severity_counts:
                severity_counts[sev] += 1

        summary_text = (
            f"PatchPilot identified <b>{len(vulnerabilities)}</b> security finding(s) in the "
            f"submitted code. The breakdown by severity is shown below."
        )
        story.append(Paragraph(summary_text, styles["BodyJustified"]))
        story.append(Spacer(1, 12))

        sev_data = [["Severity", "Count"]]
        sev_colors_list = []
        for sev in ("critical", "high", "medium", "low", "info"):
            count = severity_counts[sev]
            sev_data.append([sev.upper(), str(count)])
            sev_colors_list.append(_severity_color(sev))

        sev_table = Table(sev_data, colWidths=[200, 100])
        sev_table_style = [
            ("BACKGROUND", (0, 0), (-1, 0), _BRAND_BLUE),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ALIGN", (1, 0), (1, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
        ]
        for i, c in enumerate(sev_colors_list, start=1):
            sev_table_style.append(("TEXTCOLOR", (0, i), (0, i), c))
            sev_table_style.append(("FONTNAME", (0, i), (0, i), "Helvetica-Bold"))
        sev_table.setStyle(TableStyle(sev_table_style))
        story.append(sev_table)
        story.append(Spacer(1, 20))

        # ── Vulnerability Details ────────────────────────────────────────
        if vulnerabilities:
            story.append(Paragraph("Vulnerability Details", styles["Heading1"]))
            story.append(Spacer(1, 10))

            vuln_header = ["#", "Severity", "Title", "Line", "CWE"]
            vuln_rows = [vuln_header]
            for idx, v in enumerate(vulnerabilities, 1):
                vuln_rows.append([
                    str(idx),
                    v.severity.upper(),
                    self._truncate(v.title, 40),
                    str(v.line_start),
                    v.cwe_id or "—",
                ])

            vuln_table = Table(vuln_rows, colWidths=[30, 70, 230, 50, 80])
            vuln_table_style = [
                ("BACKGROUND", (0, 0), (-1, 0), _BRAND_BLUE),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, _BRAND_LIGHT]),
            ]
            # Colour-code severity column
            for i, v in enumerate(vulnerabilities, 1):
                vuln_table_style.append(
                    ("TEXTCOLOR", (1, i), (1, i), _severity_color(v.severity))
                )
                vuln_table_style.append(
                    ("FONTNAME", (1, i), (1, i), "Helvetica-Bold")
                )
            vuln_table.setStyle(TableStyle(vuln_table_style))
            story.append(vuln_table)
            story.append(Spacer(1, 20))

            # Per-vulnerability detail
            for idx, v in enumerate(vulnerabilities, 1):
                story.append(Paragraph(
                    f"Finding #{idx}: {self._esc(v.title)}",
                    styles["Heading2"],
                ))
                story.append(Spacer(1, 4))

                detail_items = [
                    f"<b>Severity:</b> {v.severity.upper()}",
                    f"<b>Category:</b> {self._esc(v.category)}",
                    f"<b>CWE:</b> {v.cwe_id or '—'}",
                    f"<b>File:</b> {self._esc(v.file)} (line {v.line_start})",
                    f"<b>Description:</b> {self._esc(v.description)}",
                ]
                for item in detail_items:
                    story.append(Paragraph(item, styles["BodyText"]))
                    story.append(Spacer(1, 2))

                if v.code_snippet:
                    story.append(Spacer(1, 4))
                    story.append(Paragraph("<b>Vulnerable Code:</b>", styles["BodyText"]))
                    story.append(Spacer(1, 2))
                    story.append(Preformatted(
                        self._wrap_code(v.code_snippet),
                        styles["CodeBlock"],
                    ))

                story.append(Spacer(1, 4))
                story.append(Paragraph(
                    f"<b>Recommendation:</b> {self._esc(v.recommendation)}",
                    styles["BodyJustified"],
                ))

                # Show patch if available
                if patches:
                    matching = [p for p in patches if p.vulnerability_id == v.id]
                    if matching:
                        p = matching[0]
                        story.append(Spacer(1, 6))
                        story.append(Paragraph("<b>Suggested Fix:</b>", styles["BodyText"]))
                        story.append(Preformatted(
                            self._wrap_code(p.patched_code),
                            styles["CodeBlockGreen"],
                        ))
                        story.append(Paragraph(
                            f"<i>{self._esc(p.explanation)}</i>",
                            styles["BodyText"],
                        ))

                story.append(Spacer(1, 16))
                story.append(HRFlowable(width="100%", color=colors.lightgrey, thickness=0.5))
                story.append(Spacer(1, 10))

        # ── Code sections ────────────────────────────────────────────────
        story.append(PageBreak())
        story.append(Paragraph("Appendix: Source Code", styles["Heading1"]))
        story.append(Spacer(1, 10))

        story.append(Paragraph("<b>Original Code</b>", styles["Heading2"]))
        story.append(Spacer(1, 4))
        story.append(Preformatted(
            self._wrap_code(original_code[:5000]),
            styles["CodeBlock"],
        ))

        if patched_code:
            story.append(Spacer(1, 16))
            story.append(Paragraph("<b>Patched Code</b>", styles["Heading2"]))
            story.append(Spacer(1, 4))
            story.append(Preformatted(
                self._wrap_code(patched_code[:5000]),
                styles["CodeBlockGreen"],
            ))

        # ── Build ────────────────────────────────────────────────────────
        doc.build(story)
        return buf.getvalue()

    # ── helpers ──────────────────────────────────────────────────────────

    @staticmethod
    def _register_custom_styles(styles):
        styles.add(ParagraphStyle(
            "ReportTitle",
            parent=styles["Title"],
            fontSize=32,
            textColor=_BRAND_BLUE,
            alignment=TA_CENTER,
            spaceAfter=6,
        ))
        styles.add(ParagraphStyle(
            "ReportSubtitle",
            parent=styles["Normal"],
            fontSize=16,
            textColor=colors.grey,
            alignment=TA_CENTER,
            spaceAfter=20,
        ))
        styles.add(ParagraphStyle(
            "BodyJustified",
            parent=styles["BodyText"],
            alignment=TA_JUSTIFY,
            fontSize=10,
            leading=14,
        ))
        styles.add(ParagraphStyle(
            "CodeBlock",
            fontName="Courier",
            fontSize=7,
            leading=9,
            backColor=colors.HexColor("#f3f4f6"),
            borderColor=colors.HexColor("#d1d5db"),
            borderWidth=0.5,
            borderPadding=6,
            leftIndent=10,
            rightIndent=10,
            spaceAfter=8,
        ))
        styles.add(ParagraphStyle(
            "CodeBlockGreen",
            fontName="Courier",
            fontSize=7,
            leading=9,
            backColor=colors.HexColor("#ecfdf5"),
            borderColor=colors.HexColor("#6ee7b7"),
            borderWidth=0.5,
            borderPadding=6,
            leftIndent=10,
            rightIndent=10,
            spaceAfter=8,
        ))

    @staticmethod
    def _truncate(text: str, max_len: int) -> str:
        return text if len(text) <= max_len else text[: max_len - 1] + "…"

    @staticmethod
    def _esc(text: str) -> str:
        """Escape XML-special characters for ReportLab Paragraph."""
        return (
            text.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
        )

    @staticmethod
    def _wrap_code(code: str, width: int = 95) -> str:
        """Wrap long lines so they fit the PDF column."""
        wrapped_lines: list[str] = []
        for line in code.splitlines():
            if len(line) > width:
                wrapped_lines.extend(textwrap.wrap(line, width=width, subsequent_indent="    "))
            else:
                wrapped_lines.append(line)
        return "\n".join(wrapped_lines)


# Module-level singleton
report_generator = ReportGenerator()
