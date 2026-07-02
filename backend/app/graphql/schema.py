import strawberry

from app.graphql.queries.hello import Query

schema = strawberry.Schema(query=Query)