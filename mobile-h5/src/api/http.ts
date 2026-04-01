import axios, { type AxiosRequestConfig } from 'axios';

import { clearToken, getToken } from '../auth/session';

export type ApiBody<T = unknown> = {
  code?: number;
  success?: boolean;
  data?: T;
  message?: string;
};

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Omit Authorization (e.g. login) */
    skipAuth?: boolean;
  }
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_PREFIX || '/v1',
  timeout: 120_000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  if (config.skipAuth) {
    delete config.headers.Authorization;
  } else {
    const t = getToken();
    if (t) {
      config.headers.Authorization = t;
    }
  }
  return config;
});

http.interceptors.response.use(
  (res) => {
    const expire = res.headers['session-expire-time'];
    if (expire && typeof expire === 'string') {
      sessionStorage.setItem('mobile_session_expire', expire);
    }
    return res;
  },
  (err) => {
    const cfg = err.config as { skipAuth?: boolean } | undefined;
    if (cfg?.skipAuth) {
      return Promise.reject(err);
    }
    const code = err.response?.data?.code;
    const status = err.response?.status;
    if (status === 401 || [4000001, 40032116, 514].includes(Number(code))) {
      clearToken();
      if (!window.location.pathname.endsWith('/login')) {
        window.location.assign(`${window.location.origin}/login`);
      }
    }
    return Promise.reject(err);
  },
);

/** Same as PC `utils/request` `isSuccessResponse`: 2xx business code or missing code counts as success */
const API_SUCCESS_CODES = new Set([200, 201, 202, 203, 204, 205, 206]);

export function isApiSuccess(body: ApiBody): boolean {
  if (body == null) return false;
  if (body.success === false) return false;
  if (body.success === true) return true;
  const c = body.code;
  if (c === undefined || c === null) return true;
  return API_SUCCESS_CODES.has(Number(c));
}

/**
 * Close to PC Qs.stringify + encode: colons in values become `%3A` so behavior matches PC.
 * Semantics match an unencoded query; backend parses the same.
 */
function serializeGetParams(params: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [key, raw] of Object.entries(params)) {
    if (raw === undefined || raw === null) continue;
    const k = encodeURIComponent(key);
    if (Array.isArray(raw)) {
      for (const item of raw) {
        if (item === undefined || item === null) continue;
        parts.push(`${k}=${encodeURIComponent(String(item))}`);
      }
    } else {
      parts.push(`${k}=${encodeURIComponent(String(raw))}`);
    }
  }
  return parts.join('&');
}

export async function apiGet<T>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<ApiBody<T>> {
  const res = await http.get<ApiBody<T>>(url, {
    ...config,
    params,
    paramsSerializer: {
      serialize: serializeGetParams,
    },
  });
  return res.data;
}

export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiBody<T>> {
  const res = await http.post<ApiBody<T>>(url, data, config);
  return res.data;
}
