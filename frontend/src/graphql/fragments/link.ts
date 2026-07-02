import { gql } from "@apollo/client";

export const LINK_FRAGMENT = gql`
  fragment LinkFields on ShortLink {
    id
    originalUrl
    shortCode
    clickCount
    isActive
    expiresAt
    createdAt
    updatedAt
    userId
  }
`;
