import { apiClient } from './apiClient';

// Backend: CommunityPlatform.Application.DTOs.Employee.EmployeeProfileResponse
export interface EmployeeProfile {
  userId: string;
  interests: string[];
  hobbies: string[];
  totalAttendedWorkshops: number;
  xpPoints: number;
  rankLevel: number;
}

// Backend: CommunityPlatform.Application.DTOs.Employee.EmployeeProfileRequest
export interface UpdateEmployeeProfileRequest {
  interests?: string[];
  hobbies?: string[];
}

const BASE_URL = '/employee';

export const employeeService = {
  /**
   * GET /api/v1/employee/profile
   */
  getProfile: async (): Promise<EmployeeProfile> => {
    const response = await apiClient.get<EmployeeProfile>(`${BASE_URL}/profile`);
    return response.data;
  },

  /**
   * PUT /api/v1/employee/profile
   */
  updateProfile: async (data: UpdateEmployeeProfileRequest): Promise<EmployeeProfile> => {
    const response = await apiClient.put<EmployeeProfile>(`${BASE_URL}/profile`, data);
    return response.data;
  },
};

export default employeeService;