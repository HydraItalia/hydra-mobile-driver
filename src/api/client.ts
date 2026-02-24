import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/src/config";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from "@/src/auth/storage";

// ── Auth failure callback ───────────────────────────────────────────────────
export let onAuthFailure: (() => void) | null = null;
export function setOnAuthFailure(fn: (() => void) | null) {
  onAuthFailure = fn;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// ── Request interceptor: attach Bearer token ─────────────────────────────────

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ───────────────────────────────

const AUTH_PATHS = ["/api/mobile/auth/"];

let refreshPromise: Promise<string | null> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // Don't retry auth endpoints
    const url = originalRequest.url || "";
    if (AUTH_PATHS.some((p) => url.includes(p))) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Coalesce concurrent refresh attempts
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const refresh = await getRefreshToken();
          if (!refresh) return null;

          // Use raw axios to avoid circular dependency with api/auth.ts
          const { data } = await axios.post<{
            accessToken: string;
            refreshToken: string;
          }>(
            `${API_BASE_URL}/api/mobile/auth/refresh`,
            { refreshToken: refresh },
            { timeout: 10000 },
          );
          await setAccessToken(data.accessToken);
          await setRefreshToken(data.refreshToken);
          return data.accessToken;
        } catch {
          await clearTokens();
          onAuthFailure?.();
          return null;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    const newToken = await refreshPromise;
    if (!newToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return apiClient(originalRequest);
  },
);

export default apiClient;
