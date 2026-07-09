import { apiClient } from './apiClient';

export type SpaceBookingStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Completed';

export interface SpaceBookingResponse {
  id: string;
  spaceListingId: string;
  employerProfileId: string;
  startDateTime: string;
  endDateTime: string;
  status: SpaceBookingStatus;
  totalPrice: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  spaceListingTitle?: string | null;
  cafeProfileId?: string | null;
  cafeName?: string | null;
  cafeCity?: string | null;
  employerWorkshopTitle?: string | null;
  employerFullName?: string | null;
}

export interface SpaceBooking {
  id: string;
  spaceListingId: string;
  employerProfileId: string;
  startDateTime: string;
  endDateTime: string;
  status: SpaceBookingStatus;
  totalPrice: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  spaceListingTitle: string | null;
  cafeProfileId: string | null;
  cafeName: string | null;
  cafeCity: string | null;
  employerWorkshopTitle: string | null;
  employerFullName: string | null;
}

export interface CreateSpaceBookingRequest {
  spaceListingId: string;
  startDateTime: string;
  endDateTime: string;
  notes?: string;
}

function mapResponse(response: SpaceBookingResponse): SpaceBooking {
  return {
    id: response.id,
    spaceListingId: response.spaceListingId,
    employerProfileId: response.employerProfileId,
    startDateTime: response.startDateTime,
    endDateTime: response.endDateTime,
    status: response.status,
    totalPrice: response.totalPrice,
    notes: response.notes ?? null,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
    spaceListingTitle: response.spaceListingTitle ?? null,
    cafeProfileId: response.cafeProfileId ?? null,
    cafeName: response.cafeName ?? null,
    cafeCity: response.cafeCity ?? null,
    employerWorkshopTitle: response.employerWorkshopTitle ?? null,
    employerFullName: response.employerFullName ?? null,
  };
}

export const spaceBookingService = {
  // Employer: yeni rezervasyon talebi oluşturur → "Pending"
  // 409 (tarih aralığı dolu) dahil hatalar burada yakalanmaz, olduğu gibi throw edilir; ekranlar yakalar.
  async create(data: CreateSpaceBookingRequest): Promise<SpaceBooking> {
    const { data: response } = await apiClient.post<SpaceBookingResponse>('/space-bookings', data);
    return mapResponse(response);
  },

  // Employer: kendi oluşturduğu rezervasyon talepleri
  async getMine(): Promise<SpaceBooking[]> {
    const { data } = await apiClient.get<SpaceBookingResponse[]>('/space-bookings/mine');
    return data.map(mapResponse);
  },

  // Cafe: kendi ilanlarına gelen rezervasyon talepleri
  async getIncoming(): Promise<SpaceBooking[]> {
    const { data } = await apiClient.get<SpaceBookingResponse[]>('/space-bookings/incoming');
    return data.map(mapResponse);
  },

  // Cafe: rezervasyon talebini onaylar
  async approve(id: string): Promise<SpaceBooking> {
    const { data } = await apiClient.put<SpaceBookingResponse>(`/space-bookings/${id}/approve`);
    return mapResponse(data);
  },

  // Cafe: rezervasyon talebini reddeder
  async reject(id: string): Promise<SpaceBooking> {
    const { data } = await apiClient.put<SpaceBookingResponse>(`/space-bookings/${id}/reject`);
    return mapResponse(data);
  },

  // Employer: kendi talebini iptal eder
  async cancel(id: string): Promise<SpaceBooking> {
    const { data } = await apiClient.put<SpaceBookingResponse>(`/space-bookings/${id}/cancel`);
    return mapResponse(data);
  },
};
