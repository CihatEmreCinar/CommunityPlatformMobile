import type { User, UserEmployeeProfile, UserEmployerProfile } from '../../types/auth';
import type {
  MyEmployeeProfileDto,
  MyEmployerProfileDto,
  MyProfileDto,
  UploadedFileResponseDto,
} from '../../types/user.api';
import type { UploadedFileResponse } from '../userService';
import { normalizeApiMediaUrl, debugLogMediaUrl } from '../urlUtils';

function mapEmployeeProfile(dto: MyEmployeeProfileDto | null): UserEmployeeProfile | null {
  if (!dto) {
    return null;
  }

  return {
    interests: dto.interests ?? [],
    hobbies: dto.hobbies ?? [],
    totalAttendedWorkshops: dto.totalAttendedWorkshops,
  };
}

function mapEmployerProfile(dto: MyEmployerProfileDto | null): UserEmployerProfile | null {
  if (!dto) {
    return null;
  }

  return {
    workshopTitle: dto.workshopTitle,
    specialization: dto.specialization ?? [],
    categoryIds: dto.categoryIds ?? [],
    categoryNames: dto.categoryNames ?? [],
    yearsExperience: dto.yearsExperience,
    coverImageUrl: normalizeApiMediaUrl(dto.coverImageUrl),
    avgRating: dto.avgRating,
    totalWorkshops: dto.totalWorkshops,
    employerRank: dto.employerRank,
  };
}

export function mapMyProfile(dto: MyProfileDto): User {
  if (__DEV__) {
    console.log('[ME_PROFILE] avatarUrl=', JSON.stringify(dto.avatarUrl), '| coverImageUrl=', JSON.stringify((dto.employerProfile as any)?.coverImageUrl));
  }

  return {
    id: dto.id,
    email: dto.email,
    firstName: dto.firstName,
    lastName: dto.lastName,
    role: dto.role as User['role'],
    city: dto.city,
    cityId: dto.cityId,
    district: dto.district,
    districtId: dto.districtId,
    bio: dto.bio,
    avatarUrl: normalizeApiMediaUrl(dto.avatarUrl),
    xpPoints: dto.xpPoints,
    rankLevel: dto.rankLevel,
    isVerified: dto.isVerified,
    createdAt: dto.createdAt,
    employeeProfile: mapEmployeeProfile(dto.employeeProfile),
    employerProfile: mapEmployerProfile(dto.employerProfile),
  };
}

export function mapUploadedFileResponse(dto: UploadedFileResponseDto): UploadedFileResponse {
  if (__DEV__) {
    console.log('[UPLOAD_RESPONSE] raw dto=', JSON.stringify(dto));
  }
  debugLogMediaUrl('upload.url', dto.url);
  const normalizedUrl = normalizeApiMediaUrl(dto.url);

  return {
    url: normalizedUrl ?? '',
    sizeBytes: dto.sizeBytes,
  };
}