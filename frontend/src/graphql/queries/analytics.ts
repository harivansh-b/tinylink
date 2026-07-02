import { gql } from "@apollo/client";
import { ANALYTICS_FRAGMENT } from "@/graphql/fragments/analytics";

export const GET_ANALYTICS = gql`
  ${ANALYTICS_FRAGMENT}
  query GetAnalytics($linkId: ID, $days: Int) {
    analytics(linkId: $linkId, days: $days) {
      ...AnalyticsFields
    }
  }
`;
