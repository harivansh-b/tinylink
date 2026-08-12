/**
 * useCurrentPlan — fetches the authenticated user's current subscription plan
 * from the GraphQL `me` query. Cached by Apollo so all consumers stay in sync.
 */
import { useQuery, useApolloClient } from "@apollo/client/react";
import { useAuth } from "@clerk/clerk-react";
import { GET_ME } from "@/graphql/queries/me";

export type PlanTier = "free" | "pro" | "enterprise";

interface MeData {
    me: {
        id: string;
        email: string;
        display_name: string | null;
        plan: PlanTier;
        plan_expires_at: string | null;
    };
}

export function useCurrentPlan() {
    const { isSignedIn, isLoaded } = useAuth();
    const client = useApolloClient();

    const { data, loading, refetch } = useQuery<MeData>(GET_ME, {
        skip: !isLoaded || !isSignedIn,
        // Always go to network — plan is a billing-critical field
        fetchPolicy: "network-only",
        // Keep using network on every subsequent call so we never serve stale plan from cache
        nextFetchPolicy: "network-only",
    });

    const plan: PlanTier = data?.me?.plan ?? "free";

    /** Force a fresh network fetch just for this hook's query. */
    async function invalidate() {
        await client.refetchQueries({ include: [GET_ME] });
    }

    return {
        plan,
        planExpiresAt: data?.me?.plan_expires_at ?? null,
        loading,
        refetch,   // direct useQuery refetch — most reliable for post-payment refresh
        invalidate, // global cache invalidation helper
        isPro: plan === "pro" || plan === "enterprise",
        isEnterprise: plan === "enterprise",
    };
}
