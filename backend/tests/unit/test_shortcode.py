"""Unit tests for short code generation and alias validation."""

import pytest

from app.utils.shortcode import (
    base62_encode,
    generate_short_code,
    validate_alias,
    RESERVED_WORDS,
)


class TestBase62Encode:
    def test_zero(self):
        assert base62_encode(0) == "0"

    def test_small_number(self):
        result = base62_encode(62)
        assert result == "10"

    def test_large_number(self):
        result = base62_encode(100000)
        assert len(result) > 0
        # Should only contain base62 chars
        allowed = set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz")
        assert set(result).issubset(allowed)


class TestGenerateShortCode:
    def test_default_length(self):
        code = generate_short_code()
        assert len(code) == 7

    def test_custom_length(self):
        code = generate_short_code(length=8)
        assert len(code) == 8

    def test_uniqueness(self):
        codes = {generate_short_code() for _ in range(100)}
        assert len(codes) == 100  # All should be unique


class TestValidateAlias:
    def test_valid_alias(self):
        validate_alias("my-link")
        validate_alias("test_123")
        validate_alias("abc")

    def test_too_short(self):
        with pytest.raises(ValueError, match="at least"):
            validate_alias("ab")

    def test_too_long(self):
        with pytest.raises(ValueError, match="at most"):
            validate_alias("a" * 21)

    def test_invalid_chars(self):
        with pytest.raises(ValueError, match="invalid characters"):
            validate_alias("bad alias!")

    def test_reserved_word(self):
        for word in ["admin", "health", "graphql"]:
            with pytest.raises(ValueError, match="reserved"):
                validate_alias(word)
