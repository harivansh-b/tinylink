/**
 * useCurrentPlan — always fetches the user's live subscription plan
 * directly from the backend via a raw GraphQL POST. No Apollo cache involved.
 *
 * Re-fetches:
 *  - On mount
 *  - Whenever `refetch()` is called (e.g. after payment)
 *  - Whenever the auth session changes
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";

export type PlanTier = "free" | "pro" | "enterprise";

interface PlanState {
    plan: PlanTier;
    planExpiresAt: string | null;
    loading: boolean;
    error: string | null;
}

// Derive the bare API base — strip /graphql suffix if someone sets VITE_API_URL wrong
const _rawBase: string =
    import.meta.env.VITE_API_URL ||
    // Fall back: strip /graphql from VITE_GRAPHQL_URL
    (import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:8000/graphql").replace(/\/graphql\/?$/, "");
const API_BASE = _rawBase.replace(/\/graphql\/?$/, "");
const GRAPHQL_URL = `${API_BASE}/graphql`;

const ME_QUERY = `
  query GetMe {
    me {
      id
      plan
      planExpiresAt
    }
  }
`;

export function useCurrentPlan() {
    const { getToken, isSignedIn, isLoaded } = useAuth();

    const [state, setState] = useState<PlanState>({
        plan: "free",
        planExpiresAt: null,
        loading: true,
        error: null,
    });

    // Bump this counter to trigger a re-fetch
    const [fetchTick, setFetchTick] = useState(0);
    const abortRef = useRef<AbortController | null>(null);

    const fetchPlan = useCallback(async () => {
        if (!isLoaded || !isSignedIn) {
            setState((s) => ({ ...s, plan: "free", loading: false }));
            return;
        }

        // Cancel any in-flight request
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setState((s) => ({ ...s, loading: true, error: null }));

        try {
            // Always get a fresh token — never use a cached one for billing data
            const token = await getToken({ skipCache: true });
            if (!token) throw new Error("No auth token");

            const res = await fetch(GRAPHQL_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ query: ME_QUERY }),
                signal: controller.signal,
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const json = await res.json() as {
                data?: { me?: { plan: string; planExpiresAt: string | null } };
                errors?: { message: string }[];
            };

            if (json.errors?.length) {
                throw new Error(json.errors[0].message);
            }

            const me = json.data?.me;
            const plan = (me?.plan ?? "free").toLowerCase() as PlanTier;

            setState({
                plan,
                planExpiresAt: me?.planExpiresAt ?? null,
                loading: false,
                error: null,
            });
        } catch (err: unknown) {
            if ((err as Error).name === "AbortError") return; // request was cancelled — ignore
            setState((s) => ({
                ...s,
                loading: false,
                error: err instanceof Error ? err.message : String(err),
            }));
        }
    }, [isLoaded, isSignedIn, getToken]);

    // Re-fetch whenever auth state changes OR fetchTick is bumped
    useEffect(() => {
        fetchPlan();
        return () => {
            abortRef.current?.abort();
        };
    }, [fetchPlan, fetchTick]);

    /** Call after a successful payment to get the real plan from the backend. */
    function refetch() {
        setFetchTick((t) => t + 1);
    }

    const plan = state.plan;

    return {
        plan,
        planExpiresAt: state.planExpiresAt,
        loading: state.loading,
        error: state.error,
        refetch,
        isPro: plan === "pro" || plan === "enterprise",
        isEnterprise: plan === "enterprise",
    };
}
