"""Abstract base class for all PatchPilot scanners."""

from __future__ import annotations

import abc

from app.models import Vulnerability


class BaseScanner(abc.ABC):
    """Every scanner must implement :meth:`scan`."""

    name: str = "base"
    description: str = "Base scanner"

    @abc.abstractmethod
    def scan(self, code: str, filename: str = "<input>") -> list[Vulnerability]:
        """Analyse *code* and return a list of vulnerabilities found."""
        ...
