import { api } from "../lib/api";

export const dashboardApi = {
  async getDashboardData() {
    const response = await api.get("/api/v1/instructor/dashboard/");
    return response.data;
  },
};
