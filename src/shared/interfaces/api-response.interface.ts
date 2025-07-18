import type { PaginationMetadata } from "./pagination.interface";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ApiMetadata;
}

export interface ApiError {
  name: string;
  message: string;
  code?: string;
  issues?: Record<string, string[]>;
}

export interface ApiMetadata {
  timestamp: string;
  requestId?: string;
  pagination?: PaginationMetadata;
}
