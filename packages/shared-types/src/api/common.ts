/**
 * Common API Type Definitions for SafetyOS
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: ResponseMeta;
  error?: ApiError;
}

export interface ResponseMeta {
  requestId: string;
  timestamp: string;
  version: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>[];
  traceId?: string;
}

export type SeverityLevel = 'info' | 'low' | 'medium' | 'high' | 'critical' | 'catastrophic';

export interface BaseEntity {
  id: string;
  tenantId: string;
  siteId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isDeleted?: boolean;
}
