/**
 * Auth, RBAC & User Session Domain Types
 */

export type UserRole =
  | 'SHIFT_SUPERVISOR'
  | 'CONTROL_ROOM_OPERATOR'
  | 'HSE_MANAGER'
  | 'SAFETY_OFFICER'
  | 'PLANT_HEAD'
  | 'AUDITOR'
  | 'FIELD_OPERATOR'
  | 'CONTRACTOR'
  | 'IT_OT_ENGINEER'
  | 'CISO'
  | 'SUPER_ADMIN';

export interface UserProfile {
  id: string;
  tenantId: string;
  siteId: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  permissions: string[];
  zoneAssignments: string[];
}

export interface AuthSession {
  accessToken: string;
  expiresAt: number;
  user: UserProfile;
}
