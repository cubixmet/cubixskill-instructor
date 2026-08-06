import { api } from "../lib/api";
import assignmentsMock from "./mock/assignments.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true" || true;

export const assignmentsApi = {
  async getAssignments() {
    if (USE_MOCK) {
      return assignmentsMock;
    }
    const response = await api.get("/api/v1/instructor/assignments/");
    return response.data;
  },
};
