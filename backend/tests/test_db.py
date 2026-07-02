from sqlalchemy import text
from app.config.settings import settings

print(settings.DATABASE_URL)
from app.db.session import engine


with engine.connect() as connection:
    result = connection.execute(text("SELECT version();"))

    print(result.scalar())