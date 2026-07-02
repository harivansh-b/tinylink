import { useQuery } from "@apollo/client/react";
import { GET_ANALYTICS } from "@/graphql/queries/analytics";
import { GET_DASHBOARD_STATS } from "@/graphql/queries/links";
import type {
    GQLAnalyticsResponse,
    GQLDashboardStatsResponse,
} from "@/types";

export function useAnalytics(linkId?: string, days = 30) {
    const { data, loading, error } = useQuery<GQLAnalyticsResponse>(
        GET_ANALYTICS,
        {
            variables: { linkId, days },
            skip: false,
        }
    );

    return {
        analytics: data?.analytics ?? null,
        loading,
        error,
    };
}

export function useDashboardStats() {
    const { data, loading, error } = useQuery<GQLDashboardStatsResponse>(
        GET_DASHBOARD_STATS
    );

    return {
        stats: data?.dashboardStats ?? null,
        loading,
        error,
    };
}
