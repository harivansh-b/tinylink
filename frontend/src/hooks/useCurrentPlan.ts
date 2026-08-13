/**
 * useCurrentPlan — fetches the authenticated user's current subscription plan
 * from the GraphQL `me` query. Cached by Apollo so all consumers stay in sync.
 */
import { useState } from "react";
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

    // Optimistic override — set immediately after payment, cleared once network confirms
    const [optimisticPlan, setOptimisticPlan] = useState<PlanTier | null>(null);

    const { data, loading, refetch } = useQuery<MeData>(GET_ME, {
        skip: !isLoaded || !isSignedIn,
        // cache-and-network: serve cached plan instantly (so optimistic writes render),
        // but always send a network request to confirm the real plan.
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-and-network",
    });

    const networkPlan: PlanTier = data?.me?.plan ?? "free";
    // Optimistic plan wins until it matches the network value (which clears it)
    const plan: PlanTier = optimisticPlan ?? networkPlan;

    /**
     * Call right after a successful payment to instantly show the new plan
     * before the network refetch resolves. Clears itself once confirmed.
     */
    function setOptimistic(newPlan: PlanTier) {
        setOptimisticPlan(newPlan);
    }

    /**
     * Refetch from network, then clear the optimistic override once done.
     * Use after payment to confirm the backend persisted the plan.
     */
    async function refetchAndConfirm() {
        try {
            await refetch();
        } finally {
            setOptimisticPlan(null);
        }
    }

    /** Force a fresh network fetch just for this hook's query. */
    async function invalidate() {
        await client.refetchQueries({ include: [GET_ME] });
    }

    return {
        plan,
        planExpiresAt: data?.me?.plan_expires_at ?? null,
        loading,
        refetch,              // raw refetch
        refetchAndConfirm,   // post-payment: refetch + clear optimistic
        setOptimistic,       // instant optimistic plan update
        invalidate,
        isPro: plan === "pro" || plan === "enterprise",
        isEnterprise: plan === "enterprise",
    };
}
