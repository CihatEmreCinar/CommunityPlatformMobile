import { apiClient } from './apiClient';
import { TicketPreview, CheckInResult, Participant } from '../types/ticket';

export const ticketService = {
  async verify(qrPayload: string): Promise<TicketPreview> {
    const { data } = await apiClient.post<TicketPreview>('/tickets/verify', { qrPayload });
    return data;
  },

  async checkIn(qrPayload: string): Promise<CheckInResult> {
    const { data } = await apiClient.post<CheckInResult>('/tickets/check-in', { qrPayload });
    return data;
  },

  async getWorkshopParticipants(workshopId: string): Promise<Participant[]> {
    const { data } = await apiClient.get<Participant[]>(`/workshops/${workshopId}/enrollments`);
    return data;
  },
};
