import {
    ApolloClient,
    InMemoryCache,
    ApolloLink,
    createHttpLink,
    from,
} from "@apollo/client";
import { Observable } from "@apollo/client/utilities";
import { GET_ME } from "@/graphql/queries/me";

const httpLink = createHttpLink({
    uri: import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:8000/graphql",
});

// ── Clerk JWT token getter ────────────────────────────────────────────────────
// Registered by ClerkApolloSync in App.tsx once Clerk has loaded.
let getClerkToken: (() => Promise<string | null>) | null = null;
let clerkEmail: string | null = null;
let clerkDisplayName: string | null = null;

export function setClerkTokenGetter(fn: () => Promise<string | null>): void {
    getClerkToken = fn;
}

export function setClerkUserInfo(email: string | null, displayName: string | null): void {
    clerkEmail = email;
    clerkDisplayName = displayName;
}

// ── Auth link ─────────────────────────────────────────────────────────────────
// Fetches the Clerk JWT and injects it as an Authorization header before the
// request is forwarded to httpLink.  Uses a plain object form of setContext
// (not the callback form) to avoid the double-then / callback-never-called bug.
const authLink = new ApolloLink((operation, forward) => {
    return new Observable((observer) => {
        let cancelled = false;
        let innerSub: { unsubscribe(): void } | undefined;

        (getClerkToken ? getClerkToken() : Promise.resolve(null))
            .then((token) => {
                if (cancelled) return;

                // Read current context headers (e.g. from previous links)
                const { headers = {} } = operation.getContext() as {
                    headers?: Record<string, string>;
                };

                // Merge the Authorization and Clerk User Info headers using the object form
                operation.setContext({
                    headers: {
                        ...headers,
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        ...(clerkEmail ? { "X-Clerk-Email": clerkEmail } : {}),
                        ...(clerkDisplayName ? { "X-Clerk-Display-Name": clerkDisplayName } : {}),
                    },
                });

                // Forward the operation *inside* this .then() so context is
                // already set when httpLink reads it.
                innerSub = forward(operation).subscribe({
                    next: observer.next.bind(observer),
                    error: observer.error.bind(observer),
                    complete: observer.complete.bind(observer),
                });
            })
            .catch((err) => {
                if (!cancelled) observer.error(err);
            });

        // Return cleanup — called when the subscription is cancelled
        return () => {
            cancelled = true;
            innerSub?.unsubscribe();
        };
    });
});

// ── Cache ─────────────────────────────────────────────────────────────────────
const cache = new InMemoryCache({
    typePolicies: {
        UserType: {
            // Apollo identifies UserType objects by their `id` field.
            // `merge: true` means incoming fields overwrite cached fields in-place
            // so writing `plan` directly into the cache works immediately.
            keyFields: ["id"],
            merge: true,
        },
        Query: {
            fields: {
                myUrls: {
                    keyArgs: ["search", "status", "orderBy"],
                    merge(_existing, incoming) {
                        return incoming;
                    },
                },
                // Never serve `me` from cache alone — always validate with network.
                // This prevents stale plan data after payment.
                me: {
                    read(existing) {
                        return existing;
                    },
                },
            },
        },
    },
});

// ── Client ────────────────────────────────────────────────────────────────────
export const apolloClient = new ApolloClient({
    link: from([authLink, httpLink]),
    cache,
    defaultOptions: {
        watchQuery: {
            // Use network-only globally so watchQuery never serves stale cache
            fetchPolicy: "network-only",
            nextFetchPolicy: "network-only",
        },
        query: {
            fetchPolicy: "network-only",
        },
    },
});

/**
 * Immediately write a new plan value into the Apollo cache for the `me` query.
 * Call this right after a successful payment to update the UI synchronously,
 * before waiting for any network refetch.
 */
export function updateCachedPlan(plan: string): void {
    try {
        // Read current me from cache using the exact same document useQuery uses
        const existing = apolloClient.readQuery<{ me: { __typename: string; id: string; plan: string } }>({
            query: GET_ME,
        });
        if (!existing?.me) return;

        // Write updated plan back — triggers all useQuery(GET_ME) subscribers to re-render immediately
        apolloClient.writeQuery({
            query: GET_ME,
            data: {
                me: {
                    ...existing.me,
                    plan,
                },
            },
        });
    } catch {
        // Cache miss is fine — the upcoming refetch will populate it
    }
}
