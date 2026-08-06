import { api } from "../lib/api";
import studentsMock from "./mock/students.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true" || true;

export const studentsApi = {
  async getStudents() {
    if (USE_MOCK) {
      return studentsMock;
    }
    const response = await api.get("/api/v1/instructor/students/");
    return response.data;
  },
};
