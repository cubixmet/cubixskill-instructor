import { useStudentStore } from '../store/student.store';
import type { StudentDetail, CreateStudentInput, UpdateStudentInput } from '../types/student.types';

export const studentService = {
  getStudents: (): StudentDetail[] => {
    return useStudentStore.getState().getStudents();
  },

  getStudentByUuid: (uuid: string): StudentDetail | undefined => {
    return useStudentStore.getState().getStudentByUuid(uuid);
  },

  createStudent: (data: CreateStudentInput): StudentDetail => {
    return useStudentStore.getState().addStudent(data);
  },

  updateStudent: (uuid: string, updates: UpdateStudentInput): void => {
    useStudentStore.getState().updateStudent(uuid, updates);
  },

  deleteStudent: (uuid: string): void => {
    useStudentStore.getState().deleteStudent(uuid);
  },

  toggleStudentStatus: (uuid: string): void => {
    useStudentStore.getState().toggleStudentStatus(uuid);
  },
};
