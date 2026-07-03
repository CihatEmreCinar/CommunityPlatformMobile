export interface MyEmployeeProfileDto {
  interests: string[];
  hobbies: string[];
  totalAttendedWorkshops: number;
}

export interface MyEmployerProfileDto {
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

export interface MyProfileDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  city: string | null;
  bio: string | null;
  avatarUrl: string | null;
  xpPoints: number;
  rankLevel: number;
  isVerified: boolean;
  createdAt: string;
  employeeProfile: MyEmployeeProfileDto | null;
  employerProfile: MyEmployerProfileDto | null;
}

export interface UploadedFileResponseDto {
  url: string;
  sizeBytes: number;
}