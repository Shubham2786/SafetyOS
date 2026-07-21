/**
 * Incident & Hazard Management Domain Types
 */

import { BaseEntity, SeverityLevel } from '../api/common';

export type IncidentCategory =
  | 'NEAR_MISS'
  | 'FIRST_AID'
  | 'MEDICAL_TREATMENT'
  | 'LOST_TIME_INJURY'
  | 'FATALITY'
  | 'PROPERTY_DAMAGE'
  | 'ENVIRONMENTAL_SPILL'
  | 'FIRE_EXPLOSION';

export type IncidentStatus =
  | 'REPORTED'
  | 'UNDER_INVESTIGATION'
  | 'ACTION_REQUIRED'
  | 'PENDING_REVIEW'
  | 'CLOSED'
  | 'REOPENED';

export interface Incident extends BaseEntity {
  incidentNumber: string;
  category: IncidentCategory;
  severity: SeverityLevel;
  status: IncidentStatus;
  title: string;
  summary: string;
  occurredAt: string;
  reportedAt: string;
  reporterId: string;
  zoneId: string;
  assetId?: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    elevation?: number;
  };
  attachments: IncidentAttachment[];
  causalFactors?: string[];
  rcaId?: string;
  correctiveActions: CorrectiveAction[];
}

export interface IncidentAttachment {
  id: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  faceBlurred?: boolean;
}

export interface CorrectiveAction {
  id: string;
  actionNumber: string;
  description: string;
  assigneeId: string;
  dueDate: string;
  completedAt?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'VERIFIED';
}
