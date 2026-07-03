import { gql } from "@apollo/client";
import { LINK_FRAGMENT } from "@/graphql/fragments/link";

export const CREATE_LINK = gql`
  ${LINK_FRAGMENT}
  mutation CreateShortUrl($input: CreateShortURLInput!) {
    createShortUrl(input: $input) {
      ...LinkFields
    }
  }
`;

export const UPDATE_LINK = gql`
  ${LINK_FRAGMENT}
  mutation UpdateShortUrl($id: UUID!, $input: UpdateShortURLInput!) {
    updateShortUrl(id: $id, input: $input) {
      ...LinkFields
    }
  }
`;

export const DELETE_LINK = gql`
  ${LINK_FRAGMENT}
  mutation DeleteShortUrl($id: UUID!) {
    deleteShortUrl(id: $id) {
      ...LinkFields
    }
  }
`;

export const TOGGLE_FAVORITE = gql`
  ${LINK_FRAGMENT}
  mutation ToggleFavorite($id: UUID!) {
    toggleFavorite(id: $id) {
      ...LinkFields
    }
  }
`;
