import {
    ApolloClient,
    InMemoryCache,
    ApolloLink,
    createHttpLink,
    from,
} from "@apollo/client";
import { Observable } from "@apollo/client/utilities";

const httpLink = createHttpLink({
    uri: import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:8000/graphql",
});

// Clerk JWT auth link — injected at runtime
let getClerkToken: (() => Promise<string | null>) | null = null;

export function setClerkTokenGetter(fn: () => Promise<string | null>): void {
    getClerkToken = fn;
}

// Apollo v4: setContext removed — use a plain ApolloLink with Observable
const authLink = new ApolloLink((operation, forward) => {
    return new Observable((observer) => {
        (getClerkToken ? getClerkToken() : Promise.resolve(null))
            .then((token) => {
                operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
                    headers: {
                        ...headers,
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }));
            })
            .then(() => {
                const sub = forward(operation).subscribe({
                    next: observer.next.bind(observer),
                    error: observer.error.bind(observer),
                    complete: observer.complete.bind(observer),
                });
                return () => sub.unsubscribe();
            })
            .catch(observer.error.bind(observer));
    });
});

const cache = new InMemoryCache({
    typePolicies: {
        Query: {
            fields: {
                links: {
                    keyArgs: ["search", "status", "sortBy", "sortOrder"],
                    merge(existing, incoming) {
                        return incoming;
                    },
                },
            },
        },
    },
});

export const apolloClient = new ApolloClient({
    link: from([authLink, httpLink]),
    cache,
    defaultOptions: {
        watchQuery: {
            fetchPolicy: "cache-and-network",
        },
        query: {
            fetchPolicy: "network-only",
        },
    },
});
