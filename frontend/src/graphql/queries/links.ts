import { gql } from "@apollo/client";
import { LINK_FRAGMENT } from "@/graphql/fragments/link";

export const GET_LINKS = gql`
  ${LINK_FRAGMENT}
  query GetLinks(
    $page: Int
    $limit: Int
    $search: String
    $status: String
    $orderBy: String
  ) {
    myUrls(
      page: $page
      limit: $limit
      search: $search
      status: $status
      orderBy: $orderBy
    ) {
      items {
        ...LinkFields
      }
      pagination {
        page
        limit
        totalCount
        totalPages
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const GET_LINK = gql`
  ${LINK_FRAGMENT}
  query GetLink($id: UUID!) {
    url(id: $id) {
      ...LinkFields
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalLinks
      totalClicks
      activeLinks
      expiredLinks
    }
  }
`;
