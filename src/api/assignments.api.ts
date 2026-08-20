import { api } from "../lib/api";

export const assignmentsApi = {
  async getAssignments() {
    const response = await api.get("/api/v1/instructor/assignments/");
    return response.data;
  },
};
