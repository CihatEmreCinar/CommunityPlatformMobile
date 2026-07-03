import { apiClient } from './apiClient';
import type { User } from '../types/auth';

export const userService = {
  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>('/users/me');
    return data;
  },
};