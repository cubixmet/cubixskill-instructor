import { api } from "../lib/api";
import settingsMock from "./mock/settings.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true" || true;

export const settingsApi = {
  async getSettings() {
    if (USE_MOCK) {
      return settingsMock;
    }
    const response = await api.get("/api/v1/instructor/settings/");
    return response.data;
  },
};
