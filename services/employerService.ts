import { apiClient } from './apiClient';
import { EmployerDashboard } from '../types/dashboard';
import type { UploadedFileResponse } from './userService';
import type { UploadedFileResponseDto } from '../types/user.api';
import { mapUploadedFileResponse } from './mappers/userMapper';

export interface EmployerProfile {
  userId: string;
  workshopTitle: string;
  specialization: string[];
  categoryIds: string[];
  categoryNames: string[];
  yearsExperience: number | null;
  coverImageUrl: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  city: string | null;
  avgRating: number;
  totalWorkshops: number;
  employerRank: string;
}

export interface EmployerProfileRequest {
  workshopTitle: string;
  specialization?: string[];
  categoryIds?: string[];
  yearsExperience?: number;
  coverImageUrl?: string;
  profileImageUrl?: string;
  bio?: string;
  city?: string;
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
  categoryNames: string[];
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

  async uploadEmployerCover(file: FormData): Promise<UploadedFileResponse> {
    const { data } = await apiClient.post<UploadedFileResponseDto>('/employer/profile/cover', file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapUploadedFileResponse(data);
  },

  async getPublicProfile(id: string): Promise<EmployerPublicProfile> {
    const { data } = await apiClient.get<EmployerPublicProfile>(`/employers/${id}/profile`);
    return data;
  },
};