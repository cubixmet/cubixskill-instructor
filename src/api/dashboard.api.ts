import { api } from "../lib/api";
import dashboardMock from "./mock/dashboard.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true" || true;

export const dashboardApi = {
  async getDashboardData() {
    if (USE_MOCK) {
      return dashboardMock;
    }
    const response = await api.get("/api/v1/instructor/dashboard/");
    return response.data;
  },
};
