import { apiClient } from './apiClient';
import { normalizeApiMediaUrl } from './urlUtils';
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
}

export interface CafeProfileRequest {
  name?: string;
  bio?: string;
  city?: string;
  address?: string;
}

function normalizeCafeProfile(profile: CafeProfile): CafeProfile {
  return {
    ...profile,
    avatarUrl: normalizeApiMediaUrl(profile.avatarUrl),
    coverImageUrl: normalizeApiMediaUrl(profile.coverImageUrl),
  };
}

export const cafeService = {
  async getMyProfile(): Promise<CafeProfile> {
    const { data } = await apiClient.get<CafeProfile>('/cafe-profiles/me');
    return normalizeCafeProfile(data);
  },

  async updateProfile(data: CafeProfileRequest): Promise<CafeProfile> {
    const { data: response } = await apiClient.put<CafeProfile>('/cafe-profiles/me', data);
    return normalizeCafeProfile(response);
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

  async getProfileById(id: string): Promise<CafeProfile> {
    const { data } = await apiClient.get<CafeProfile>(`/cafe-profiles/${id}`);
    return normalizeCafeProfile(data);
  },
};
