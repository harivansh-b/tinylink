"""Unit tests for ShortURLService."""

from datetime import datetime, timedelta, timezone

import pytest

from app.services.url import ShortURLService
from app.models.url import ShortURL
from app.models.user import User
from app.exceptions import (
    AliasAlreadyExistsError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
)


class TestURLValidation:
    def test_valid_https_url(self, db, test_user):
        svc = ShortURLService(db)
        svc._validate_url("https://example.com/path")

    def test_valid_http_url(self, db, test_user):
        svc = ShortURLService(db)
        svc._validate_url("http://example.com")

    def test_invalid_scheme(self, db, test_user):
        svc = ShortURLService(db)
        with pytest.raises(ValidationError, match="not allowed"):
            svc._validate_url("ftp://example.com")

    def test_javascript_scheme(self, db, test_user):
        svc = ShortURLService(db)
        with pytest.raises(ValidationError, match="not allowed"):
            svc._validate_url("javascript:alert(1)")

    def test_missing_host(self, db, test_user):
        svc = ShortURLService(db)
        with pytest.raises(ValidationError, match="no host"):
            svc._validate_url("https://")


class TestExpiryValidation:
    def test_future_date_valid(self, db):
        svc = ShortURLService(db)
        future = datetime.now(timezone.utc) + timedelta(days=30)
        svc._validate_expiry(future)

    def test_past_date_invalid(self, db):
        svc = ShortURLService(db)
        past = datetime.now(timezone.utc) - timedelta(days=1)
        with pytest.raises(ValidationError, match="future"):
            svc._validate_expiry(past)

    def test_none_valid(self, db):
        svc = ShortURLService(db)
        svc._validate_expiry(None)


class TestCreateURL:
    def test_create_with_auto_code(self, db, test_user):
        svc = ShortURLService(db)
        url = svc.create(test_user, "https://example.com")
        assert url.short_code
        assert url.original_url == "https://example.com"
        assert url.user_id == test_user.id
        assert url.is_active is True

    def test_create_with_custom_alias(self, db, test_user):
        svc = ShortURLService(db)
        url = svc.create(test_user, "https://example.com", custom_alias="my-link")
        assert url.short_code == "my-link"

    def test_create_with_title(self, db, test_user):
        svc = ShortURLService(db)
        url = svc.create(test_user, "https://example.com", title="My Test")
        assert url.title == "My Test"


class TestOwnership:
    def test_assert_owner_passes(self, db, test_user, test_url):
        svc = ShortURLService(db)
        svc._assert_owner(test_url, test_user)

    def test_assert_owner_fails(self, db, test_url):
        svc = ShortURLService(db)
        other_user = User(clerk_id="other", email="other@test.com")
        db.add(other_user)
        db.flush()
        with pytest.raises(UnauthorizedError):
            svc._assert_owner(test_url, other_user)
