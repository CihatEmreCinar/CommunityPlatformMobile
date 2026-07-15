import { apiClient } from './apiClient';
import { Workshop, WorkshopRequest, WorkshopSearchFilters, WorkshopSearchResult } from '../types/workshop';

interface WorkshopSearchPageResponse {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: Workshop[];
}

export interface WorkshopNearbyParams {
  /** İkisi de verilmezse backend fallback zincirini çalıştırır (tercih edilen
   *  ilçe → aynı şehir → popüler → son eklenenler). */
  latitude?: number;
  longitude?: number;
  /** km cinsinden arama yarıçapı, backend varsayılanı 20. */
  radius?: number;
  limit?: number;
}

export const workshopService = {
  async getAll(params?: { status?: string; page?: number; limit?: number }): Promise<Workshop[]> {
    const { data } = await apiClient.get<Workshop[]>('/workshops', { params });
    return data;
  },

  /**
   * GET /workshops/nearby — konum izni verilmişse Haversine ile gerçek
   * mesafe sıralaması (DistanceKm dolu döner); verilmemişse backend
   * PreferredDistrict → aynı şehir → popüler → son eklenenler fallback
   * zincirini uygular.
   */
  async getNearby(params?: WorkshopNearbyParams): Promise<Workshop[]> {
    const { data } = await apiClient.get<Workshop[]>('/workshops/nearby', { params });
    return data;
  },

  async getRecommended(): Promise<Workshop[]> {
    const { data } = await apiClient.get<Workshop[]>('/workshops/recommended');
    return data;
  },

  async search(filters?: WorkshopSearchFilters): Promise<WorkshopSearchResult> {
    const { data } = await apiClient.get<WorkshopSearchPageResponse>('/workshops/search', {
      params: filters,
    });
    return {
      workshops: data.items ?? [],
      page: data.page ?? 1,
      pageSize: data.pageSize ?? 20,
      total: data.total ?? 0,
      totalPages: data.totalPages ?? 0,
      hasNextPage: (data.page ?? 1) < (data.totalPages ?? 0),
    };
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

  async getMyWorkshops(status?: string): Promise<Workshop[]> {
    const { data } = await apiClient.get<Workshop[]>('/workshops/mine', {
      params: status ? { status } : undefined,
    });
    return data;
  },
};