"""Gemma 4 API client – OpenAI-compatible chat completions endpoint."""

from __future__ import annotations

import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


class GemmaClient:
    """Thin async wrapper around a Gemma 4 (or compatible) chat completions API."""

    def __init__(self) -> None:
        self._api_url: str | None = settings.GEMMA_API_URL
        self._api_key: str | None = settings.GEMMA_API_KEY
        self._model: str = settings.GEMMA_MODEL

    @property
    def is_available(self) -> bool:
        """Return True when the API URL and key are both configured."""
        return bool(self._api_url and self._api_key)

    async def generate(self, prompt: str, max_tokens: int = 2048) -> str | None:
        """Send a chat-completion request and return the assistant's reply text.

        Returns ``None`` on any failure (network, timeout, bad response) so callers
        can fall back to rule-based behaviour.
        """
        if not self.is_available:
            logger.warning("Gemma client called but API URL/key not configured.")
            return None

        url = f"{self._api_url.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self._model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are PatchPilot, an expert cybersecurity code-review assistant. "
                        "You analyse vulnerabilities and produce concise, correct code patches. "
                        "Reply ONLY with the requested output – no extra commentary."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": 0.2,
        }

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(60.0)) as client:
                resp = await client.post(url, headers=headers, json=payload)
                resp.raise_for_status()
                data = resp.json()
                choices = data.get("choices", [])
                if choices:
                    return choices[0].get("message", {}).get("content", "").strip()
                logger.error("Gemma API returned no choices: %s", data)
                return None
        except httpx.TimeoutException:
            logger.error("Gemma API request timed out.")
            return None
        except httpx.HTTPStatusError as exc:
            logger.error("Gemma API HTTP error %s: %s", exc.response.status_code, exc.response.text[:500])
            return None
        except Exception:
            logger.exception("Unexpected error calling Gemma API.")
            return None


# Module-level singleton
gemma_client = GemmaClient()
