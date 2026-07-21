/**
 * Permit to Work (PTW) Domain Types
 */

import { BaseEntity } from '../api/common';

export type PermitType = 
  | 'HOT_WORK'
  | 'COLD_WORK'
  | 'CONFINED_SPACE'
  | 'HEIGHT_WORK'
  | 'ELECTRICAL_ISOLATION'
  | 'EXCAVATION'
  | 'RADIATION'
  | 'CHEMICAL_HANDLING';

export type PermitStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface PermitToWork extends BaseEntity {
  permitNumber: string;
  type: PermitType;
  status: PermitStatus;
  title: string;
  description: string;
  zoneId: string;
  assetId?: string;
  applicantId: string;
  approverId?: string;
  contractorCompany?: string;
  validFrom: string;
  validUntil: string;
  riskAssessmentId: string;
  requiredPPE: string[];
  isolationRequired: boolean;
  lotoId?: string;
  gasTestingRequired: boolean;
  gasTestingLogs?: GasTestLog[];
  signatures: PermitSignature[];
}

export interface GasTestLog {
  id: string;
  timestamp: string;
  testedBy: string;
  oxygenPercentage: number;
  combustibleLLEPercentage: number;
  toxicPPM: number;
  passed: boolean;
}

export interface PermitSignature {
  role: 'APPLICANT' | 'SUPERVISOR' | 'SAFETY_OFFICER' | 'GAS_TESTER' | 'AUTHORIZER';
  userId: string;
  userName: string;
  timestamp: string;
  digitalSignature: string;
}
