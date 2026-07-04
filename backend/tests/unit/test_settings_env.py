"""Unit tests to verify settings env loading."""

import os
from unittest.mock import patch

from app.config.settings import get_settings


def test_settings_loads_from_env():
    # Clear the lru_cache on get_settings to force a reload
    get_settings.cache_clear()

    # Define test environment variables
    test_env = {
        "DATABASE_URL": "postgresql://test:test@localhost/testdb",
        "SHORT_URL_BASE": "https://test.tiny.lnk",
        "CORS_ALLOWED_ORIGINS": "https://test.app.com",
    }

    with patch.dict(os.environ, test_env):
        settings = get_settings()
        assert settings.DATABASE_URL == test_env["DATABASE_URL"]
        assert settings.SHORT_URL_BASE == test_env["SHORT_URL_BASE"]
        assert settings.CORS_ALLOWED_ORIGINS == test_env["CORS_ALLOWED_ORIGINS"]

    # Clear cache again to restore defaults for subsequent tests
    get_settings.cache_clear()
