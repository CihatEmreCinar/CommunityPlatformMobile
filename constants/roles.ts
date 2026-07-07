export const ROLES = {
  EMPLOYER: 'employer',
  EMPLOYEE: 'employee',
  CAFE: 'cafe',
} as const;

export type RoleValue = (typeof ROLES)[keyof typeof ROLES];
