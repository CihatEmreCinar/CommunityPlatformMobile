export type UserRole = 'employer' | 'employee' | 'admin';

export interface UserEmployeeProfile {
  interests: string[];
  hobbies: string[];
  totalAttendedWorkshops: number;
}

export interface UserEmployerProfile {
  workshopTitle: string;
  specialization: string[];
  categoryIds: string[];
  categoryNames: string[];
  yearsExperience: number | null;
  coverImageUrl: string | null;
  avgRating: number;
  totalWorkshops: number;
  employerRank: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  city?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  xpPoints: number;
  rankLevel: number;
  isVerified?: boolean;
  createdAt?: string;
  employeeProfile?: UserEmployeeProfile | null;
  employerProfile?: UserEmployerProfile | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'employer' | 'employee';
  city?: string;
}