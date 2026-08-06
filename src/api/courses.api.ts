import { api } from "../lib/api";
import coursesMock from "./mock/courses.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true" || true;

export const coursesApi = {
  async getCourses() {
    if (USE_MOCK) {
      return coursesMock;
    }
    const response = await api.get("/api/v1/instructor/courses/");
    return response.data;
  },
};
