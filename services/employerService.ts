import { apiClient } from './apiClient';
import { EmployerDashboard, EmployerProfile } from '../types/dashboard';

export interface EmployerProfileRequest {
  workshopTitle: string;
  specialization?: string[];
  categoryId?: string;
  yearsExperience?: number;
  coverImageUrl?: string;
}

export const employerService = {
  async getDashboard(): Promise<EmployerDashboard> {
    const { data } = await apiClient.get<EmployerDashboard>('/employer/dashboard');
    return data;
  },

  async getProfile(): Promise<EmployerProfile> {
    const { data } = await apiClient.get<EmployerProfile>('/employer/profile');
    return data;
  },

  async updateProfile(request: EmployerProfileRequest): Promise<EmployerProfile> {
    const { data } = await apiClient.put<EmployerProfile>('/employer/profile', request);
    return data;
  },
};