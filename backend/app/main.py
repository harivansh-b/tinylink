from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter

from app.graphql.schema import schema

app = FastAPI(
    title="TinyLink API",
    version="1.0.0",
)

from app.db.dependencies import get_db
from app.graphql.context import Context

async def get_context():
    db = next(get_db())

    return Context(db=db)

graphql_app = GraphQLRouter(
    schema,
    context_getter=get_context,
)

app.include_router(
    graphql_app,
    prefix="/graphql",
)