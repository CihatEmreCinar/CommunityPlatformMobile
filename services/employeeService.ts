import { apiClient } from './apiClient';
import { normalizeApiMediaUrl } from './urlUtils';
import type { UploadedFileResponse } from './userService';
import type { UploadedFileResponseDto } from '../types/user.api';
import { mapUploadedFileResponse } from './mappers/userMapper';

// Backend: CommunityPlatform.Application.DTOs.Employee.EmployeeProfileResponse
export interface EmployeeProfile {
  userId: string;
  interests: string[];
  hobbies: string[];
  bio: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  city: string | null;
  cityId: string | null;
  district: string | null;
  districtId: string | null;
  // Atölye keşfi için tercih edilen bölge — kayıt/kişisel şehirden bağımsız,
  // GPS izni yoksa "nearby" fallback zincirinin ilk adımı olarak kullanılır.
  preferredCity: string | null;
  preferredCityId: string | null;
  preferredDistrict: string | null;
  preferredDistrictId: string | null;
  totalAttendedWorkshops: number;
  xpPoints: number;
  rankLevel: number;
}

// Backend: CommunityPlatform.Application.DTOs.Employee.EmployeeProfileRequest
export interface UpdateEmployeeProfileRequest {
  interests?: string[];
  hobbies?: string[];
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  cityId?: string;
  districtId?: string;
  preferredCityId?: string;
  preferredDistrictId?: string;
}

const BASE_URL = '/employee';

function normalizeEmployeeProfile(profile: EmployeeProfile): EmployeeProfile {
  return {
    ...profile,
    avatarUrl: normalizeApiMediaUrl(profile.avatarUrl),
    coverImageUrl: normalizeApiMediaUrl(profile.coverImageUrl),
  };
}

export const employeeService = {
  /**
   * GET /api/v1/employee/profile
   */
  getProfile: async (): Promise<EmployeeProfile> => {
    const response = await apiClient.get<EmployeeProfile>(`${BASE_URL}/profile`);
    return normalizeEmployeeProfile(response.data);
  },

  /**
   * PUT /api/v1/employee/profile
   */
  updateProfile: async (data: UpdateEmployeeProfileRequest): Promise<EmployeeProfile> => {
    const response = await apiClient.put<EmployeeProfile>(`${BASE_URL}/profile`, data);
    return normalizeEmployeeProfile(response.data);
  },

  /**
   * POST /api/v1/employee/profile/cover
   * NOT: Backend'de EmployeeProfile.CoverImageUrl alanı + bu endpoint yeni eklendi
   * (bkz. atolium-backend: EmployeeController, EmployeeProfile.cs). Employer'daki
   * uploadEmployerCover ile birebir aynı desen.
   */
  uploadEmployeeCover: async (file: FormData): Promise<UploadedFileResponse> => {
    const { data } = await apiClient.post<UploadedFileResponseDto>(`${BASE_URL}/profile/cover`, file);
    return mapUploadedFileResponse(data);
  },
};

export default employeeService;
