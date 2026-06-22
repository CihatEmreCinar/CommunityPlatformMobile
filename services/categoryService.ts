import { apiClient } from './apiClient';
import { Category } from '../types/category';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>('/categories');
    return data;
  },
};