export interface WorkshopCategoryItem {
  id: string;
  name: string;
}

export interface Workshop {
  id: string;
  employerId: string;
  employerName: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  price: number;
  capacity: number;
  enrolledCount: number;
  locationType: 'online' | 'in-person';
  locationDetail: string | null;
  // Fiziksel etkinlik konumu — sadece locationType='in-person' iken anlamlı.
  venueName: string | null;
  address: string | null;
  city: string | null;
  cityId: string | null;
  district: string | null;
  districtId: string | null;
  latitude: number | null;
  longitude: number | null;
  startAt: string;
  endAt: string;
  status: string;
  tags: string[];
  categoryIds: string[];
  categoryNames: string[];
  avgRating: number;
  reviewCount: number;
  createdAt: string;
  /** Sadece GET /workshops/nearby ile latitude/longitude verildiğinde dolar. */
  distanceKm?: number | null;
}

export interface WorkshopRequest {
  title: string;
  description?: string;
  coverImageUrl?: string;
  price: number;
  capacity: number;
  locationType: 'online' | 'in-person';
  locationDetail?: string;
  venueName?: string;
  address?: string;
  cityId?: string;
  districtId?: string;
  latitude?: number;
  longitude?: number;
  startAt: string;
  endAt: string;
  categoryIds?: string[];
  tags?: string[];
}

export interface WorkshopSearchFilters {
  q?: string;
  city?: string;
  categoryId?: string;
  locationType?: 'online' | 'in-person';
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  maxCapacity?: number;
  startAfter?: string;
  startBefore?: string;
  page?: number;
  pageSize?: number;
}

export interface WorkshopSearchResult {
  workshops: Workshop[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}