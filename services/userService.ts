import { apiClient } from './apiClient';
import type { User } from '../types/auth';
import type { MyProfileDto, UploadedFileResponseDto } from '../types/user.api';
import { mapMyProfile, mapUploadedFileResponse } from './mappers/userMapper';

export interface UploadedFileResponse {
  url: string;
  sizeBytes: number;
}

export const userService = {
  async getMe(): Promise<User> {
    const { data } = await apiClient.get<MyProfileDto>('/users/me');
    return mapMyProfile(data);
  },

  async uploadAvatar(file: FormData): Promise<UploadedFileResponse> {
    const { data } = await apiClient.post<UploadedFileResponseDto>('/users/me/avatar', file);
    return mapUploadedFileResponse(data);
  },
};
