import { apiClient } from './apiClient';
import { normalizeApiMediaUrl } from './urlUtils';

// Backend: CommunityPlatform.Application.DTOs.Employee.EmployeeProfileResponse
export interface EmployeeProfile {
  userId: string;
  interests: string[];
  hobbies: string[];
  bio: string | null;
  avatarUrl: string | null;
  city: string | null;
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
  city?: string;
}

const BASE_URL = '/employee';

function normalizeEmployeeProfile(profile: EmployeeProfile): EmployeeProfile {
  return {
    ...profile,
    avatarUrl: normalizeApiMediaUrl(profile.avatarUrl),
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
};

export default employeeService;