import { gql } from "@apollo/client";

export const GET_ME = gql`
    query GetMe {
        me {
            __typename
            id
            email
            display_name
            plan
            plan_expires_at
        }
    }
`;
