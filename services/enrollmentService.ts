import { apiClient } from './apiClient';
import { Enrollment, EnrollmentRequest } from '../types/enrollment';

export const enrollmentService = {
  async create(request: EnrollmentRequest): Promise<Enrollment> {
    const { data } = await apiClient.post<Enrollment>('/enrollments', request);
    return data;
  },

  async getMine(): Promise<Enrollment[]> {
    const { data } = await apiClient.get<Enrollment[]>('/enrollments/me');
    return data;
  },

  async cancel(id: string): Promise<void> {
    await apiClient.delete(`/enrollments/${id}`);
  },
};