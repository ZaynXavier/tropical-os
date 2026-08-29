/// <reference types="vite/client" />
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * TROPICALOS — CENTRALIZED API CLIENT
 * Connects React frontend to Laravel 11 API Backend (REST / Sanctum).
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';
export const SESSION_STORAGE_KEY = 'tropicalos_auth_session';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export const getStoredSession = (): any | null => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('[ApiClient] Error reading stored session:', err);
    return null;
  }
};

export const getStoredToken = (): string | null => {
  const session = getStoredSession();
  return session?.token || null;
};

export const setStoredSession = (session: any): void => {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('[ApiClient] Error storing session:', err);
  }
};

export const clearStoredSession = (): void => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.warn('[ApiClient] Error clearing stored session:', err);
  }
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

// Request Interceptor: Attach Bearer Token to outgoing requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centralized error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        console.warn('[ApiClient] Session expired or unauthorized (401).');
        // Do not force reload if already on login page
        if (typeof window !== 'undefined' && window.location.pathname === '/login') {
          clearStoredSession();
        }
      } else if (status === 403) {
        console.warn('[ApiClient] Access Forbidden (403): Module/Endpoint is restricted by RBAC.');
      } else if (status === 422) {
        console.warn('[ApiClient] Validation Error (422):', error.response.data);
      } else if (status >= 500) {
        console.error('[ApiClient] Server Error (500+):', error.response.data);
      }
    } else if (error.request) {
      console.warn('[ApiClient] Network notice: Backend at', API_BASE_URL, 'did not respond. Using local fallback.');
    }
    return Promise.reject(error);
  }
);

// Typed Helper Methods
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.get<ApiResponse<T>>(url, config);
  },
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.post<ApiResponse<T>>(url, data, config);
  },
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.put<ApiResponse<T>>(url, data, config);
  },
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.patch<ApiResponse<T>>(url, data, config);
  },
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.delete<ApiResponse<T>>(url, config);
  },
};

export default api;
