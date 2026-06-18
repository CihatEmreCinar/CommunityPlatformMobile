import { apiClient } from './apiClient';
import { Workshop, WorkshopRequest } from '../types/workshop';

export const workshopService = {
  async getAll(params?: { status?: string; page?: number; limit?: number }): Promise<Workshop[]> {
    const { data } = await apiClient.get<Workshop[]>('/workshops', { params });
    return data;
  },

  async getRecommended(): Promise<Workshop[]> {
    const { data } = await apiClient.get<Workshop[]>('/workshops/recommended');
    return data;
  },

  async getById(id: string): Promise<Workshop> {
    const { data } = await apiClient.get<Workshop>(`/workshops/${id}`);
    return data;
  },

  async create(request: WorkshopRequest): Promise<Workshop> {
    const { data } = await apiClient.post<Workshop>('/workshops', request);
    return data;
  },

  async update(id: string, request: WorkshopRequest): Promise<Workshop> {
    const { data } = await apiClient.put<Workshop>(`/workshops/${id}`, request);
    return data;
  },

  async changeStatus(id: string, status: string): Promise<{ id: string; status: string }> {
    const { data } = await apiClient.patch(`/workshops/${id}/status`, { status });
    return data;
  },

  async getMyWorkshops(): Promise<Workshop[]> {
    const { data } = await apiClient.get<Workshop[]>('/workshops/mine');
    return data;
  },
};