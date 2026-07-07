import { apiClient } from './apiClient';
import { normalizeApiMediaUrl } from './urlUtils';
import { categoryService } from './categoryService';
import type { Category } from '../types/category';
import type { UploadedFileResponse } from './userService';
import type { UploadedFileResponseDto } from '../types/user.api';
import { mapUploadedFileResponse } from './mappers/userMapper';

export interface CafeProfile {
  id: string;
  name: string;
  bio: string | null;
  city: string | null;
  address: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  categoryNames?: string[];
  categoryIds?: string[];
}

export interface CafeDashboardStats {
  name: string;
  totalListings: number;
  activeListings: number;
  categoryCount: number;
}

export interface CafeProfileRequest {
  name?: string;
  bio?: string;
  city?: string;
  address?: string;
  categoryIds?: string[];
}

function normalizeCafeProfile(profile: CafeProfile): CafeProfile {
  return {
    ...profile,
    avatarUrl: normalizeApiMediaUrl(profile.avatarUrl),
    coverImageUrl: normalizeApiMediaUrl(profile.coverImageUrl),
  };
}

export const cafeProfileService = {
  async getMe(): Promise<CafeProfile> {
    const { data } = await apiClient.get<CafeProfile>('/cafe-profiles/me');
    return normalizeCafeProfile(data);
  },

  async updateMe(request: CafeProfileRequest): Promise<CafeProfile> {
    // Log the outgoing payload so runtime network bodies can be inspected in Metro/console
    console.log('PUT /api/v1/cafe-profiles/me payload:', request);
    const { data } = await apiClient.put<CafeProfile>('/cafe-profiles/me', request);
    return normalizeCafeProfile(data);
  },

  async getCategories(): Promise<Category[]> {
    return categoryService.getAll();
  },

  async getDashboard(): Promise<CafeDashboardStats> {
    const { data } = await apiClient.get<CafeDashboardStats>('/cafe-profiles/dashboard');
    return data;
  },

  async uploadAvatar(uri: string): Promise<UploadedFileResponse> {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: 'avatar.jpg',
      type: 'image/jpeg',
    } as any);
    const { data } = await apiClient.post<UploadedFileResponseDto>('/cafe-profiles/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapUploadedFileResponse(data);
  },

  async uploadCover(uri: string): Promise<UploadedFileResponse> {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: 'cover.jpg',
      type: 'image/jpeg',
    } as any);
    const { data } = await apiClient.post<UploadedFileResponseDto>('/cafe-profiles/me/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapUploadedFileResponse(data);
  },
};
