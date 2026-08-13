import { gql } from "@apollo/client";

export const GET_ME = gql`
    query GetMe {
        me {
            __typename
            id
            email
            displayName
            plan
            planExpiresAt
        }
    }
`;
