from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter

from app.graphql.schema import schema

app = FastAPI(
    title="TinyLink API",
    version="1.0.0",
)
graphql_app = GraphQLRouter(schema)

app.include_router(
    graphql_app,
    prefix="/graphql",
)