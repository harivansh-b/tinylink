import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
    timeout: 10_000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor — attach Clerk token if available
apiClient.interceptors.request.use(async (config) => {
    return config;
});

// Response interceptor — global error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired / invalid — Clerk will handle re-auth
        }
        return Promise.reject(error);
    }
);

export default apiClient;
