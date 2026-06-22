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
  startAt: string;
  endAt: string;
  status: string;
  tags: string[];
  categoryIds: string[];
  categoryNames: string[];
  avgRating: number;
  reviewCount: number;
  createdAt: string;
}

export interface WorkshopRequest {
  title: string;
  description?: string;
  coverImageUrl?: string;
  price: number;
  capacity: number;
  locationType: 'online' | 'in-person';
  locationDetail?: string;
  startAt: string;
  endAt: string;
  categoryIds?: string[];
  tags?: string[];
}