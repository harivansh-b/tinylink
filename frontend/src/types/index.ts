// -------------------------------------------------- //
// Core domain types                                   //
// -------------------------------------------------- //

export interface ShortLink {
    id: string;
    originalUrl: string;
    shortCode: string;
    title: string | null;
    clickCount: number;
    isActive: boolean;
    isFavorite: boolean;
    expiresAt: string | null;
    createdAt: string;
    updatedAt: string;
    shortUrl: string;
}

export interface User {
    id: string;
    email: string;
    displayName: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Click {
    id: string;
    urlId: string;
    ipAddress: string | null;
    browser: string | null;
    device: string | null;
    country: string | null;
    referer: string | null;
    createdAt: string;
}

// -------------------------------------------------- //
// Analytics types                                     //
// -------------------------------------------------- //

export interface DailyClick {
    date: string;
    clicks: number;
}

export interface StatItem {
    name: string;
    count: number;
}

export interface AnalyticsData {
    urlId: string;
    shortCode: string;
    totalClicks: number;
    uniqueVisitors: number;
    dailyClicks: DailyClick[];
    topBrowsers: StatItem[];
    topDevices: StatItem[];
    topCountries: StatItem[];
    topReferrers: StatItem[];
}

export interface DashboardStats {
    totalLinks: number;
    totalClicks: number;
    activeLinks: number;
    expiredLinks: number;
}

// -------------------------------------------------- //
// Form / input types                                  //
// -------------------------------------------------- //

export interface CreateLinkInput {
    originalUrl: string;
    customAlias?: string;
    expiresAt?: string;
    title?: string;
}

export interface UpdateLinkInput {
    customAlias?: string;
    expiresAt?: string | null;
    isActive?: boolean;
    title?: string;
}

// -------------------------------------------------- //
// Pagination                                          //
// -------------------------------------------------- //

export interface PaginationMeta {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: PaginationMeta;
}

export interface PaginationParams {
    page: number;
    limit: number;
    search?: string;
    status?: LinkStatus;
    orderBy?: string;
}

// -------------------------------------------------- //
// Enums / union types                                 //
// -------------------------------------------------- //

export type LinkStatus = "all" | "active" | "inactive" | "expired";
export type ThemeMode = "light" | "dark" | "system";
export type ToastType = "success" | "error" | "warning" | "info";

// -------------------------------------------------- //
// UI types                                            //
// -------------------------------------------------- //

export interface ToastItem {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

export interface NavItem {
    label: string;
    href: string;
    icon: string;
    badge?: number;
}

export interface StatCardData {
    title: string;
    value: number | string;
    change?: number;
    changeLabel?: string;
    icon: string;
    colorClass: string;
}

// -------------------------------------------------- //
// GraphQL response wrappers                           //
// -------------------------------------------------- //

export interface GQLLinksResponse {
    myUrls: PaginatedResponse<ShortLink>;
}

export interface GQLLinkResponse {
    url: ShortLink;
}

export interface GQLDashboardStatsResponse {
    dashboardStats: DashboardStats;
}

export interface GQLAnalyticsResponse {
    analytics: AnalyticsData;
}

export interface GQLCreateLinkResponse {
    createShortUrl: ShortLink;
}

export interface GQLUpdateLinkResponse {
    updateShortUrl: ShortLink;
}

export interface GQLDeleteLinkResponse {
    deleteShortUrl: ShortLink;
}

export interface GQLToggleFavoriteResponse {
    toggleFavorite: ShortLink;
}
