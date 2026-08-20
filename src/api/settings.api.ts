import { api } from "../lib/api";

export const settingsApi = {
  async getSettings() {
    const response = await api.get("/api/v1/instructor/settings/");
    return response.data;
  },
};
