import { useQuery, useMutation } from "@apollo/client/react";
import { useState, useCallback } from "react";
import { GET_LINKS } from "@/graphql/queries/links";
import {
    CREATE_LINK,
    UPDATE_LINK,
    DELETE_LINK,
    TOGGLE_LINK_ACTIVE,
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
} from "@/types";

export function useLinks(initialParams?: Partial<PaginationParams>) {
    const [params, setParams] = useState<PaginationParams>({
        page: 1,
        pageSize: 10,
        search: "",
        status: "all",
        sortBy: "createdAt",
        sortOrder: "desc",
        ...initialParams,
    });

    const { data, loading, error, refetch } = useQuery<GQLLinksResponse>(
        GET_LINKS,
        {
            variables: {
                page: params.page,
                pageSize: params.pageSize,
                search: params.search || undefined,
                status: params.status === "all" ? undefined : params.status,
                sortBy: params.sortBy,
                sortOrder: params.sortOrder,
            },
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

    const [toggleLinkMutation] = useMutation(TOGGLE_LINK_ACTIVE, {
        refetchQueries: [GET_LINKS],
    });

    const createLink = useCallback(
        (input: CreateLinkInput) =>
            createLinkMutation({ variables: { input } }),
        [createLinkMutation]
    );

    const updateLink = useCallback(
        (input: UpdateLinkInput) =>
            updateLinkMutation({ variables: { input } }),
        [updateLinkMutation]
    );

    const deleteLink = useCallback(
        (id: string) => deleteLinkMutation({ variables: { id } }),
        [deleteLinkMutation]
    );

    const toggleActive = useCallback(
        (id: string) => toggleLinkMutation({ variables: { id } }),
        [toggleLinkMutation]
    );

    const updateParams = useCallback((updates: Partial<PaginationParams>) => {
        setParams((prev) => ({ ...prev, ...updates, page: 1 }));
    }, []);

    const setPage = useCallback((page: number) => {
        setParams((prev) => ({ ...prev, page }));
    }, []);

    const links: ShortLink[] = data?.links?.items ?? [];
    const total = data?.links?.total ?? 0;
    const hasNextPage = data?.links?.hasNextPage ?? false;

    return {
        links,
        total,
        hasNextPage,
        loading,
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
        toggleActive,
        refetch,
    };
}
