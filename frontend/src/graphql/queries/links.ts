import { gql } from "@apollo/client";
import { LINK_FRAGMENT } from "@/graphql/fragments/link";

export const GET_LINKS = gql`
  ${LINK_FRAGMENT}
  query GetLinks(
    $page: Int
    $pageSize: Int
    $search: String
    $status: String
    $sortBy: String
    $sortOrder: String
  ) {
    links(
      page: $page
      pageSize: $pageSize
      search: $search
      status: $status
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      items {
        ...LinkFields
      }
      total
      page
      pageSize
      hasNextPage
    }
  }
`;

export const GET_LINK = gql`
  ${LINK_FRAGMENT}
  query GetLink($id: ID!) {
    link(id: $id) {
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
