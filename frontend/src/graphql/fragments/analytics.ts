import { gql } from "@apollo/client";

export const ANALYTICS_FRAGMENT = gql`
  fragment AnalyticsFields on AnalyticsData {
    totalClicks
    uniqueVisitors
    topReferrer
    dailyClicks {
      date
      clicks
    }
    browserStats {
      browser
      count
      percentage
    }
    deviceStats {
      device
      count
      percentage
    }
    countryStats {
      country
      count
      percentage
    }
  }
`;
