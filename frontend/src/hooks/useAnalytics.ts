import { useQuery } from "@apollo/client/react";
import { useAuth } from "@clerk/clerk-react";
import { GET_ANALYTICS } from "@/graphql/queries/analytics";
import { GET_DASHBOARD_STATS } from "@/graphql/queries/links";
import type {
    GQLAnalyticsResponse,
    GQLDashboardStatsResponse,
} from "@/types";

export function useAnalytics(urlId?: string, days = 30) {
    const { isSignedIn, isLoaded } = useAuth();

    const { data, loading, error } = useQuery<GQLAnalyticsResponse>(
        GET_ANALYTICS,
        {
            variables: { urlId, days },
            // Skip when: no urlId provided, OR Clerk isn't loaded, OR user isn't signed in
            skip: !urlId || !isLoaded || !isSignedIn,
        }
    );

    return {
        analytics: data?.analytics ?? null,
        loading,
        error,
    };
}

export function useDashboardStats() {
    const { isSignedIn, isLoaded } = useAuth();

    const { data, loading, error } = useQuery<GQLDashboardStatsResponse>(
        GET_DASHBOARD_STATS,
        {
            // Skip until Clerk confirms user is signed in
            skip: !isLoaded || !isSignedIn,
        }
    );

    return {
        stats: data?.dashboardStats ?? null,
        loading: loading || !isLoaded,
        error,
    };
}
