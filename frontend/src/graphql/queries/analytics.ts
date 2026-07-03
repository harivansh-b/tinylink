import { gql } from "@apollo/client";
import { ANALYTICS_FRAGMENT } from "@/graphql/fragments/analytics";

export const GET_ANALYTICS = gql`
  ${ANALYTICS_FRAGMENT}
  query GetAnalytics($urlId: UUID!, $days: Int) {
    analytics(urlId: $urlId, days: $days) {
      ...AnalyticsFields
    }
  }
`;
