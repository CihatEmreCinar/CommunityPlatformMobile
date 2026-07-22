import { apiClient } from './apiClient';
import { normalizeApiMediaUrl } from './urlUtils';

export interface SpaceListingResponse {
  id: string;
  title: string;
  description?: string | null;
  capacity: number;
  hourlyPrice: number;
  city?: string | null;
  amenities?: string[] | null;
  photoUrls?: string[] | null;
  cafeName?: string | null;
  cafeId?: string | null;
  isActive?: boolean | null;
  status?: string | null;
  createdAt?: string | null;
  cafe?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    city?: string | null;
  } | null;
}

export interface SpaceListing {
  id: string;
  title: string;
  description: string | null;
  capacity: number;
  hourlyPrice: number;
  city: string | null;
  amenities: string[];
  photoUrls: string[];
  cafeName: string | null;
  cafeId: string | null;
  isActive: boolean;
  status: string | null;
  createdAt: string | null;
  cafeAvatarUrl: string | null;
  cafeCity: string | null;
}

export interface SpaceListingRequest {
  title: string;
  description?: string;
  capacity: number;
  hourlyPrice: number;
  city?: string;
  amenities?: string[];
}

export interface SpaceListingSearchFilters {
  city?: string;
  minCapacity?: number;
  maxCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}

export interface SpaceListingSearchResult {
  listings: SpaceListing[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}

interface SpaceListingSearchPageResponse {
  items?: SpaceListingResponse[];
  listings?: SpaceListingResponse[];
  data?: SpaceListingResponse[];
  page?: number;
  pageSize?: number;
  total?: number;
  hasNextPage?: boolean;
}

interface UploadPhotoResponse {
  url: string;
  photoUrl?: string;
}

function mapResponse(response: SpaceListingResponse): SpaceListing {
  const photoUrls = (response.photoUrls ?? []).map((url) => normalizeApiMediaUrl(url) ?? url).filter(Boolean);

  return {
    id: response.id,
    title: response.title,
    description: response.description ?? null,
    capacity: response.capacity,
    hourlyPrice: response.hourlyPrice,
    city: response.city ?? null,
    amenities: response.amenities ?? [],
    photoUrls,
    cafeName: response.cafeName ?? response.cafe?.name ?? null,
    cafeId: response.cafeId ?? response.cafe?.id ?? null,
    isActive: response.isActive ?? (response.status === 'active' || response.status === 'published'),
    status: response.status ?? null,
    createdAt: response.createdAt ?? null,
    cafeAvatarUrl: normalizeApiMediaUrl(response.cafe?.avatarUrl) ?? null,
    cafeCity: response.cafe?.city ?? null,
  };
}

function normalizeListing(listing: SpaceListingResponse): SpaceListing {
  return mapResponse(listing);
}

function resolveSearchResult(response: unknown): SpaceListingSearchResult {
  if (Array.isArray(response)) {
    const listings = response.map((item) => mapResponse(item as SpaceListingResponse));
    return { listings, page: 1, pageSize: listings.length, total: listings.length, hasNextPage: false };
  }

  const pageResponse = response as SpaceListingSearchPageResponse;
  const items = pageResponse.items ?? pageResponse.listings ?? pageResponse.data;
  if (items && Array.isArray(items)) {
    const listings = items.map((item) => mapResponse(item));
    return {
      listings,
      page: pageResponse.page ?? 1,
      pageSize: pageResponse.pageSize ?? listings.length,
      total: pageResponse.total ?? listings.length,
      hasNextPage: pageResponse.hasNextPage ?? false,
    };
  }

  return { listings: [], page: 1, pageSize: 0, total: 0, hasNextPage: false };
}

export const spaceListingService = {
  async create(data: SpaceListingRequest): Promise<SpaceListing> {
    const { data: response } = await apiClient.post<SpaceListingResponse>('/space-listings', data);
    return normalizeListing(response);
  },

  async update(id: string, data: SpaceListingRequest): Promise<SpaceListing> {
    const { data: response } = await apiClient.put<SpaceListingResponse>(`/space-listings/${id}`, data);
    return normalizeListing(response);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/space-listings/${id}`);
  },

  async getMine(): Promise<SpaceListing[]> {
    const { data } = await apiClient.get<SpaceListingResponse[]>('/space-listings/mine');
    return data.map(normalizeListing);
  },

  async getById(id: string): Promise<SpaceListing> {
    const { data } = await apiClient.get<SpaceListingResponse>(`/space-listings/${id}`);
    return normalizeListing(data);
  },

  async search(filters?: SpaceListingSearchFilters): Promise<SpaceListingSearchResult> {
    const { data } = await apiClient.get<SpaceListingSearchPageResponse>('/space-listings/search', {
      params: filters,
    });
    return resolveSearchResult(data);
  },

  async uploadPhoto(listingId: string, uri: string): Promise<UploadPhotoResponse> {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: uri.split('/').pop() ?? 'photo.jpg',
      type: 'image/jpeg',
    } as any);

    const { data } = await apiClient.post<UploadPhotoResponse>(`/space-listings/${listingId}/photos`, formData);
    return data;
  },
};
