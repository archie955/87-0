import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<void> | null = null;

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = api
      .post("/auth.refresh")
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

const api: AxiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    if (!err.config) {
      return Promise.reject(err);
    }

    const originalConfig = err.config as RetryConfig;

    if (
      err.response?.status === 401 &&
      !originalConfig._retry &&
      originalConfig.url !== "/auth/refresh"
    ) {
      originalConfig._retry = true;

      try {
        await refreshAccessToken();
        return api(originalConfig);
      } catch (refreshError) {
        if (refreshError instanceof AxiosError) {
          return Promise.reject(refreshError);
        } else {
          throw new AxiosError("Unexpected error whilst refreshing");
        }
      }
    }

    return Promise.reject(err);
  },
);

export default api;
