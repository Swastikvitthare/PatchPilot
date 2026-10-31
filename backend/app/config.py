"""Application configuration loaded from environment variables."""

from __future__ import annotations

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """PatchPilot backend configuration.

    All values can be overridden via environment variables (case-insensitive).
    """

    # ── Gemma 4 AI integration ───────────────────────────────────────────
    GEMMA_API_KEY: str | None = None
    GEMMA_API_URL: str | None = None
    GEMMA_MODEL: str = "google/gemma-4-27b-it"

    # ── Server ───────────────────────────────────────────────────────────
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000

    # ── CORS ─────────────────────────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:3000"

    # ── Limits ───────────────────────────────────────────────────────────
    MAX_CODE_SIZE_KB: int = 512

    # ── Logging ──────────────────────────────────────────────────────────
    LOG_LEVEL: str = "info"

    # ── App metadata ─────────────────────────────────────────────────────
    APP_VERSION: str = "1.0.0"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}

    @property
    def cors_origin_list(self) -> list[str]:
        """Return CORS origins as a list, splitting on commas."""
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


# Singleton – import this everywhere
settings = Settings()
