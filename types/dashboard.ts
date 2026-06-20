export interface EmployerDashboard {
  activeWorkshops: number;
  totalWorkshops: number;
  pendingEnrollments: number;
  totalEnrollments: number;
  avgRating: number;
  reviewCount: number;
  xpPoints: number;
  rankLevel: number;
  employerRank: string;
}

export interface EmployerCategory {
  id: string;
  name: string;
}

export interface EmployerProfile {
  userId: string;
  workshopTitle: string;
  specialization: string[];
  categories: EmployerCategory[];        // categoryId/categoryName yerine
  yearsExperience: number | null;
  coverImageUrl: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  avgRating: number;
  totalWorkshops: number;
  employerRank: string;
}

export interface EmployerProfileRequest {
  workshopTitle: string;
  specialization?: string[];
  categoryIds?: string[];
  yearsExperience?: number | null;
  coverImageUrl?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
}

export interface Review {
  id: string;
  workshopId: string;
  employeeId: string;
  employeeName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// employee tarafının gördüğü public profil
export interface EmployerPublicProfile extends EmployerProfile {
  totalParticipants: number;
  reviews: Review[];
}



{/* export interface EmployerDashboard {
  activeWorkshops: number;
  totalWorkshops: number;
  pendingEnrollments: number;
  totalEnrollments: number;
  avgRating: number;
  reviewCount: number;
  xpPoints: number;
  rankLevel: number;
  employerRank: string;
}

export interface EmployerProfile {
  userId: string;
  workshopTitle: string;
  specialization: string[];
  categoryId: string | null;
  categoryName: string | null;
  yearsExperience: number | null;
  coverImageUrl: string | null;
  avgRating: number;
  totalWorkshops: number;
  employerRank: string;
}
  */}