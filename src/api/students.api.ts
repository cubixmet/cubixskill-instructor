import { studentsService } from "../services/students.service";

export const studentsApi = {
  listStudents: (params?: Record<string, any>) => studentsService.listStudents(params),
  getStudent: (id: string) => studentsService.getStudent(id),
  enrollStudent: (payload: { student_id: string; course_id: string }) => studentsService.enrollStudent(payload),
};
