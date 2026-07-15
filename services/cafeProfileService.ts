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
  cityId: string | null;
  district: string | null;
  districtId: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  categoryNames?: string[];
  categoryIds?: string[];
  avgRating?: number;
  reviewCount?: number;
}

export interface CafeDashboardStats {
  name: string;
  totalListings: number;
  activeListings: number;
  categoryCount: number;
}

/** Başka birinin görüntülediği kafe profili (kendi profilinden farklı olarak reviewCount/avgRating öne çıkar). */
export interface CafePublicProfile {
  id: string;
  name: string;
  bio: string | null;
  city: string | null;
  cityId: string | null;
  district: string | null;
  districtId: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  categoryNames?: string[];
  avgRating?: number;
  reviewCount?: number;
}

export interface CafeProfileRequest {
  name?: string;
  bio?: string;
  cityId?: string;
  districtId?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  categoryIds?: string[];
}

function normalizeCafeProfile(profile: CafeProfile): CafeProfile {
  return {
    ...profile,
    avatarUrl: normalizeApiMediaUrl(profile.avatarUrl),
    coverImageUrl: normalizeApiMediaUrl(profile.coverImageUrl),
  };
}

function normalizeCafePublicProfile(profile: CafePublicProfile): CafePublicProfile {
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

  /**
   * NOT: Bu endpoint backend'de henüz yok — employerService.getPublicProfile ile
   * aynı REST konvansiyonu varsayılarak yazıldı (GET /cafe-profiles/{id}).
   * Backend eklenince ek bir frontend değişikliği gerekmeden çalışır.
   */
  async getPublicProfile(id: string): Promise<CafePublicProfile> {
    const { data } = await apiClient.get<CafePublicProfile>(`/cafe-profiles/${id}`);
    return normalizeCafePublicProfile(data);
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
