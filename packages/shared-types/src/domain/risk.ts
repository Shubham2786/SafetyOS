/**
 * Compound Risk & Analytics Domain Types
 */

import { BaseEntity, SeverityLevel } from '../api/common';

export interface CompoundRiskScore extends BaseEntity {
  zoneId: string;
  zoneName: string;
  currentRiskIndex: number; // 0 to 100
  previousRiskIndex: number;
  severity: SeverityLevel;
  contributingFactors: RiskFactor[];
  predictedTrend: 'RISING' | 'STABLE' | 'FALLING';
  confidenceScore: number; // 0 to 1
  computedAt: string;
}

export interface RiskFactor {
  factorId: string;
  category: 'CV_ALERT' | 'PERMIT_VIOLATION' | 'WEATHER' | 'FATIGUE' | 'GAS_LEAK' | 'EQUIPMENT_FAULT';
  weight: number;
  description: string;
  sourceEntityId: string;
}
