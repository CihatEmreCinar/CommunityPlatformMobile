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