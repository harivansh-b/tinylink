"""Test fixtures for TinyLink backend."""

import os
from collections.abc import Generator
from unittest.mock import MagicMock
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

# Override env vars before importing app
os.environ["DATABASE_URL"] = "sqlite:///test.db"
os.environ["REDIS_URL"] = "redis://localhost:6379"
os.environ["CLERK_PUBLISHABLE_KEY"] = "pk_test_dGVzdC5jbGVyay5hY2NvdW50cy5kZXYk"
os.environ["UPSTASH_REDIS_REST_URL"] = ""
os.environ["UPSTASH_REDIS_REST_TOKEN"] = ""


from app.models.base import Base
from app.models import User, ShortURL, Click  # noqa: E402


@pytest.fixture(scope="session")
def engine():
    """SQLite in-memory engine for testing."""
    eng = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(eng)
    yield eng
    Base.metadata.drop_all(eng)


@pytest.fixture
def db(engine) -> Generator[Session, None, None]:
    """Session per test with rollback."""
    session_factory = sessionmaker(bind=engine)
    session = session_factory()
    yield session
    session.rollback()
    session.close()


@pytest.fixture
def test_user(db: Session) -> User:
    """Create a test user."""
    user = User(
        id=uuid4(),
        clerk_id="clerk_test_123",
        email="test@example.com",
        display_name="Test User",
    )
    db.add(user)
    db.flush()
    return user


@pytest.fixture
def test_url(db: Session, test_user: User) -> ShortURL:
    """Create a test short URL."""
    url = ShortURL(
        id=uuid4(),
        user_id=test_user.id,
        original_url="https://example.com/very/long/url",
        short_code="abc123",
        title="Test Link",
    )
    db.add(url)
    db.flush()
    return url


@pytest.fixture
def mock_redis():
    """Mock Redis client for unit tests."""
    mock = MagicMock()
    mock.get.return_value = None
    mock.set.return_value = True
    mock.delete.return_value = 1
    mock.incr.return_value = 1
    mock.expire.return_value = True
    mock.ping.return_value = True
    pipe = MagicMock()
    pipe.incr.return_value = pipe
    pipe.expire.return_value = pipe
    pipe.execute.return_value = [1, True]
    mock.pipeline.return_value = pipe
    return mock
