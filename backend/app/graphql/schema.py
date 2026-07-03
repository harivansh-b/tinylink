"""Strawberry GraphQL schema — wires all queries and mutations."""

import strawberry
from strawberry.types import Info

from app.graphql.context import GraphQLContext
from app.graphql.queries.user import UserQuery
from app.graphql.queries.url import URLQuery
from app.graphql.queries.analytics import AnalyticsQuery
from app.graphql.mutations.url import URLMutation
from app.graphql.mutations.user import UserMutation


@strawberry.type
class Query(UserQuery, URLQuery, AnalyticsQuery):
    """Root query — merges all domain queries."""
    pass


@strawberry.type
class Mutation(URLMutation, UserMutation):
    """Root mutation — merges all domain mutations."""
    pass


schema = strawberry.Schema(query=Query, mutation=Mutation)