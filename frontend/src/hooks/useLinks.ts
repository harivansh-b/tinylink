import { useQuery, useMutation } from "@apollo/client/react";
import { useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { GET_LINKS } from "@/graphql/queries/links";
import {
    CREATE_LINK,
    UPDATE_LINK,
    DELETE_LINK,
    TOGGLE_FAVORITE,
} from "@/graphql/mutations/links";
import type {
    ShortLink,
    CreateLinkInput,
    UpdateLinkInput,
    PaginationParams,
    GQLLinksResponse,
    GQLCreateLinkResponse,
    GQLUpdateLinkResponse,
    GQLDeleteLinkResponse,
    GQLToggleFavoriteResponse,
} from "@/types";

export function useLinks(initialParams?: Partial<PaginationParams>) {
    const { isSignedIn, isLoaded } = useAuth();

    const [params, setParams] = useState<PaginationParams>({
        page: 1,
        limit: 10,
        search: "",
        status: "all",
        orderBy: "newest",
        ...initialParams,
    });

    // Skip the query until Clerk has loaded AND the user is signed in.
    // This prevents unauthenticated requests being fired on the very first render
    // before the Clerk token getter is wired up in the Apollo auth link.
    const skip = !isLoaded || !isSignedIn;

    const { data, loading, error, refetch } = useQuery<GQLLinksResponse>(
        GET_LINKS,
        {
            variables: {
                page: params.page,
                limit: params.limit,
                search: params.search || undefined,
                status: params.status === "all" ? undefined : params.status,
                orderBy: params.orderBy,
            },
            skip,
        }
    );

    const [createLinkMutation, { loading: creating }] =
        useMutation<GQLCreateLinkResponse>(CREATE_LINK, {
            refetchQueries: [GET_LINKS],
        });

    const [updateLinkMutation, { loading: updating }] =
        useMutation<GQLUpdateLinkResponse>(UPDATE_LINK, {
            refetchQueries: [GET_LINKS],
        });

    const [deleteLinkMutation, { loading: deleting }] =
        useMutation<GQLDeleteLinkResponse>(DELETE_LINK, {
            refetchQueries: [GET_LINKS],
        });

    const [toggleFavoriteMutation] = useMutation<GQLToggleFavoriteResponse>(
        TOGGLE_FAVORITE,
        {
            refetchQueries: [GET_LINKS],
        }
    );

    const createLink = useCallback(
        (input: CreateLinkInput) =>
            createLinkMutation({ variables: { input } }),
        [createLinkMutation]
    );

    const updateLink = useCallback(
        (id: string, input: UpdateLinkInput) =>
            updateLinkMutation({ variables: { id, input } }),
        [updateLinkMutation]
    );

    const deleteLink = useCallback(
        (id: string) => deleteLinkMutation({ variables: { id } }),
        [deleteLinkMutation]
    );

    const toggleFavorite = useCallback(
        (id: string) => toggleFavoriteMutation({ variables: { id } }),
        [toggleFavoriteMutation]
    );

    const updateParams = useCallback((updates: Partial<PaginationParams>) => {
        setParams((prev) => ({ ...prev, ...updates, page: 1 }));
    }, []);

    const setPage = useCallback((page: number) => {
        setParams((prev) => ({ ...prev, page }));
    }, []);

    const links: ShortLink[] = data?.myUrls?.items ?? [];
    const totalCount = data?.myUrls?.pagination?.totalCount ?? 0;
    const totalPages = data?.myUrls?.pagination?.totalPages ?? 1;
    const hasNextPage = data?.myUrls?.pagination?.hasNextPage ?? false;

    return {
        links,
        totalCount,
        totalPages,
        hasNextPage,
        loading: loading || !isLoaded,
        error,
        creating,
        updating,
        deleting,
        params,
        updateParams,
        setPage,
        createLink,
        updateLink,
        deleteLink,
        toggleFavorite,
        refetch,
    };
}
