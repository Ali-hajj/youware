import { APIResponse } from "../types";

const API_CONFIG = {
  production: {
    baseURL: "https://stuntec.org/api",
  },
  staging: {
    baseURL: "https://staging.yourdomain.com/api",
  },
  local: {
    baseURL: "http://localhost:3000/api",
  },
};

const API_ENV = (import.meta.env.VITE_API_ENV as keyof typeof API_CONFIG) || "production";

export const getApiBaseUrl = () => {
  const config = API_CONFIG[API_ENV];
  return config?.baseURL || API_CONFIG.production.baseURL;
};

interface ApiCallOptions {
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
}

export async function apiCall<T>({ path, method = "GET", body, token }: ApiCallOptions): Promise<APIResponse<T>> {
  const baseURL = getApiBaseUrl();
  const response = await fetch(`${baseURL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("API error", { path, status: response.status, data });
    throw new Error(data?.message || "Unknown API error");
  }

  return data;
}
