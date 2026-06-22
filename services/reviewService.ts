import { apiClient } from './apiClient';
import { Review, ReviewRequest, ReviewReplyRequest } from '../types/review';

export const reviewService = {
  async getAll(workshopId: string): Promise<Review[]> {
    const { data } = await apiClient.get<Review[]>(`/workshops/${workshopId}/reviews`);
    return data;
  },

  async create(workshopId: string, request: ReviewRequest): Promise<Review> {
    const { data } = await apiClient.post<Review>(`/workshops/${workshopId}/reviews`, request);
    return data;
  },

  async update(workshopId: string, reviewId: string, request: ReviewRequest): Promise<Review> {
    const { data } = await apiClient.put<Review>(`/workshops/${workshopId}/reviews/${reviewId}`, request);
    return data;
  },

  async remove(workshopId: string, reviewId: string): Promise<void> {
    await apiClient.delete(`/workshops/${workshopId}/reviews/${reviewId}`);
  },

  async reply(workshopId: string, reviewId: string, request: ReviewReplyRequest): Promise<Review> {
    const { data } = await apiClient.post<Review>(`/workshops/${workshopId}/reviews/${reviewId}/reply`, request);
    return data;
  },
};