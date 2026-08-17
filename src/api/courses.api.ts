import { coursesService } from "../services/courses.service";

export const coursesApi = {
  listCourses: (params?: Record<string, any>) => coursesService.listCourses(params),
  getCourse: (id: string) => coursesService.getCourse(id),
  createCourse: (payload: any) => coursesService.createCourse(payload),
  updateCourse: (id: string, payload: any) => coursesService.updateCourse(id, payload),
  deleteCourse: (id: string) => coursesService.deleteCourse(id),
};
