/**
 * Lockout / Tagout (LOTO) Domain Types
 */

import { BaseEntity } from '../api/common';

export type LOTOStatus = 'DRAFT' | 'APPLIED' | 'VERIFIED' | 'REMOVED' | 'AUDITED';

export interface LOTOIsolationPoint {
  id: string;
  sequenceOrder: number;
  energySource: 'ELECTRICAL' | 'MECHANICAL' | 'HYDRAULIC' | 'PNEUMATIC' | 'CHEMICAL' | 'THERMAL';
  isolationDevice: string;
  locationDescription: string;
  tagNumber: string;
  padlockId: string;
  isApplied: boolean;
  appliedByUserId?: string;
  appliedAt?: string;
  isVerified: boolean;
  verifiedByUserId?: string;
  verifiedAt?: string;
}

export interface LockoutTagoutProcedure extends BaseEntity {
  lotoNumber: string;
  equipmentId: string;
  equipmentName: string;
  status: LOTOStatus;
  isolationPoints: LOTOIsolationPoint[];
  groupLockBoxId?: string;
  zeroEnergyVerified: boolean;
  authorizedPersonId: string;
}
