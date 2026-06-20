import { apiClient } from './apiClient';
import { EmployerDashboard } from '../types/dashboard';

export interface EmployerProfile {
  userId: string;
  workshopTitle: string;
  specialization: string[];
  categoryId: string | null;
  categoryName: string | null;
  yearsExperience: number | null;
  coverImageUrl: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  avgRating: number;
  totalWorkshops: number;
  employerRank: string;
}

export interface EmployerProfileRequest {
  workshopTitle: string;
  specialization?: string[];
  categoryId?: string;
  yearsExperience?: number;
  coverImageUrl?: string;
  profileImageUrl?: string;
  bio?: string;
}
export interface PublicWorkshopItem {
  id: string;
  title: string;
  price: number;
  avgRating: number;
  startAt: string;
}

export interface EmployerPublicProfile {
  userId: string;
  firstName: string;
  lastName: string;
  workshopTitle: string;
  bio: string | null;
  profileImageUrl: string | null;
  specialization: string[];
  categoryName: string | null;
  yearsExperience: number | null;
  avgRating: number;
  totalWorkshops: number;
  employerRank: string;
  workshops: PublicWorkshopItem[];
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
  
  async getPublicProfile(id: string): Promise<EmployerPublicProfile> {
    const { data } = await apiClient.get<EmployerPublicProfile>(`/employers/${id}/profile`);
    return data;
  },
};