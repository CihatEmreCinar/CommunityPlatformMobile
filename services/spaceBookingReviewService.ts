import { apiClient } from './apiClient';
import { SpaceBookingReview, SpaceBookingReviewRequest } from '../types/spaceBookingReview';

export const spaceBookingReviewService = {
  // Employer: tamamlanmış bir rezervasyona değerlendirme yazar
  async create(bookingId: string, request: SpaceBookingReviewRequest): Promise<SpaceBookingReview> {
    const { data } = await apiClient.post<SpaceBookingReview>(
      `/space-bookings/${bookingId}/reviews`,
      request
    );
    return data;
  },

  async update(
    bookingId: string,
    reviewId: string,
    request: SpaceBookingReviewRequest
  ): Promise<SpaceBookingReview> {
    const { data } = await apiClient.put<SpaceBookingReview>(
      `/space-bookings/${bookingId}/reviews/${reviewId}`,
      request
    );
    return data;
  },

  async remove(bookingId: string, reviewId: string): Promise<void> {
    await apiClient.delete(`/space-bookings/${bookingId}/reviews/${reviewId}`);
  },

  // Cafe: bir kafe profiline ait tüm rezervasyon değerlendirmeleri
  async getByCafeProfile(cafeProfileId: string): Promise<SpaceBookingReview[]> {
    const { data } = await apiClient.get<SpaceBookingReview[]>(
      `/cafe-profiles/${cafeProfileId}/reviews`
    );
    return data;
  },
};
