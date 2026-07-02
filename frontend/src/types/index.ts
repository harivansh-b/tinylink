// -------------------------------------------------- //
// Core domain types                                   //
// -------------------------------------------------- //

export interface ShortLink {
    id: string;
    originalUrl: string;
    shortCode: string;
    clickCount: number;
    isActive: boolean;
    expiresAt: string | null;
    createdAt: string;
    updatedAt: string;
    userId: string;
}

export interface User {
    id: string;
    clerkId: string;
    email: string;
    createdAt: string;
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

export interface BrowserStat {
    browser: string;
    count: number;
    percentage: number;
}

export interface DeviceStat {
    device: string;
    count: number;
    percentage: number;
}

export interface CountryStat {
    country: string;
    count: number;
    percentage: number;
}

export interface AnalyticsData {
    totalClicks: number;
    uniqueVisitors: number;
    topReferrer: string | null;
    dailyClicks: DailyClick[];
    browserStats: BrowserStat[];
    deviceStats: DeviceStat[];
    countryStats: CountryStat[];
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
}

export interface UpdateLinkInput {
    id: string;
    originalUrl?: string;
    customAlias?: string;
    expiresAt?: string | null;
    isActive?: boolean;
}

// -------------------------------------------------- //
// Pagination                                          //
// -------------------------------------------------- //

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasNextPage: boolean;
}

export interface PaginationParams {
    page: number;
    pageSize: number;
    search?: string;
    status?: LinkStatus;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
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
    links: PaginatedResponse<ShortLink>;
}

export interface GQLLinkResponse {
    link: ShortLink;
}

export interface GQLDashboardStatsResponse {
    dashboardStats: DashboardStats;
}

export interface GQLAnalyticsResponse {
    analytics: AnalyticsData;
}

export interface GQLCreateLinkResponse {
    createLink: ShortLink;
}

export interface GQLUpdateLinkResponse {
    updateLink: ShortLink;
}

export interface GQLDeleteLinkResponse {
    deleteLink: boolean;
}
