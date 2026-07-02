import { gql } from "@apollo/client";
import { LINK_FRAGMENT } from "@/graphql/fragments/link";

export const CREATE_LINK = gql`
  ${LINK_FRAGMENT}
  mutation CreateLink($input: CreateLinkInput!) {
    createLink(input: $input) {
      ...LinkFields
    }
  }
`;

export const UPDATE_LINK = gql`
  ${LINK_FRAGMENT}
  mutation UpdateLink($input: UpdateLinkInput!) {
    updateLink(input: $input) {
      ...LinkFields
    }
  }
`;

export const DELETE_LINK = gql`
  mutation DeleteLink($id: ID!) {
    deleteLink(id: $id)
  }
`;

export const TOGGLE_LINK_ACTIVE = gql`
  ${LINK_FRAGMENT}
  mutation ToggleLinkActive($id: ID!) {
    toggleLinkActive(id: $id) {
      ...LinkFields
    }
  }
`;
