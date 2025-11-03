import axios from "axios";
import { API_URL } from "../lib/config";
import { getToken, setToken, delToken } from "./storage";
import { routes } from "./routes";

export const api = axios.create({
  baseURL: API_URL, 
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const access = getToken("access") as string | null;
  const skipAuth =
    config.url?.includes("/api/Auth/login") ||
    config.url?.includes("/api/Auth/register") ||
    config.url?.includes("/api/Auth/refresh");

  if (access && !skipAuth) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  const refresh = getToken("refresh") as string | null;
  if (!refresh) return null;
  try {
    const { data } = await api.post(routes.refresh, { refreshToken: refresh });
    const nextAccess = data?.accessToken as string | undefined;
    const nextRefresh = data?.refreshToken as string | undefined;
    if (nextAccess) setToken("access", nextAccess);
    if (nextRefresh) setToken("refresh", nextRefresh);
    return nextAccess ?? null;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config;
    if (err?.response?.status === 401 && !original._retry) {
      original._retry = true;
      refreshing ??= refreshToken();
      const newAccess = await refreshing.finally(() => (refreshing = null));
      if (newAccess) {
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      }
      delToken("access"); delToken("refresh");
    }
    return Promise.reject(err);
  }
);