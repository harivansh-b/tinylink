import { gql } from "@apollo/client";

export const ANALYTICS_FRAGMENT = gql`
  fragment AnalyticsFields on AnalyticsType {
    urlId
    shortCode
    totalClicks
    uniqueVisitors
    dailyClicks {
      date
      clicks
    }
    topBrowsers {
      name
      count
    }
    topDevices {
      name
      count
    }
    topCountries {
      name
      count
    }
    topReferrers {
      name
      count
    }
  }
`;
