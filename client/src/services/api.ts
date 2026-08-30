import type { AxiosInstance } from "axios";
import axios from "axios";
import useUserStore from "@/stores/userStore";

const api: AxiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
