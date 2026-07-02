import { useState } from "react";

interface UsePaginationOptions {
    initialPage?: number;
    initialPageSize?: number;
}

interface UsePaginationReturn {
    page: number;
    pageSize: number;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    goNext: () => void;
    goPrev: () => void;
    goFirst: () => void;
    reset: () => void;
}

export function usePagination({
    initialPage = 1,
    initialPageSize = 10,
}: UsePaginationOptions = {}): UsePaginationReturn {
    const [page, setPageState] = useState(initialPage);
    const [pageSize, setPageSizeState] = useState(initialPageSize);

    function setPage(p: number) {
        setPageState(Math.max(1, p));
    }

    function setPageSize(size: number) {
        setPageSizeState(size);
        setPageState(1); // Reset to first page on page size change
    }

    function goNext() {
        setPageState((p) => p + 1);
    }

    function goPrev() {
        setPageState((p) => Math.max(1, p - 1));
    }

    function goFirst() {
        setPageState(1);
    }

    function reset() {
        setPageState(initialPage);
        setPageSizeState(initialPageSize);
    }

    return { page, pageSize, setPage, setPageSize, goNext, goPrev, goFirst, reset };
}
