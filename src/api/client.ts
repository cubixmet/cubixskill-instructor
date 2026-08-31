import axios from "axios";
import { setupInterceptors } from "./interceptors";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds consistent timeout
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-Portal": "instructor",
  },
});

setupInterceptors(apiClient);

export default apiClient;
