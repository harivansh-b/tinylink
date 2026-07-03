import { gql } from "@apollo/client";

export const LINK_FRAGMENT = gql`
  fragment LinkFields on ShortURLType {
    id
    originalUrl
    shortCode
    title
    clickCount
    isActive
    isFavorite
    expiresAt
    createdAt
    updatedAt
    shortUrl
  }
`;
