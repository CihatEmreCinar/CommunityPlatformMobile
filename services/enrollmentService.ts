import { apiClient } from './apiClient';
import { Enrollment, EnrollmentRequest, EmployerEnrollment } from '../types/enrollment';

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

  async getEmployerEnrollments(status?: string): Promise<EmployerEnrollment[]> {
    const { data } = await apiClient.get<EmployerEnrollment[]>('/employer/enrollments', {
      params: status && status !== 'all' ? { status } : undefined,
    });
    return data;
  },

  async approve(id: string): Promise<void> {
    await apiClient.patch(`/enrollments/${id}/approve`, {});
  },

  async reject(id: string): Promise<void> {
    await apiClient.patch(`/enrollments/${id}/reject`, {});
  },
};