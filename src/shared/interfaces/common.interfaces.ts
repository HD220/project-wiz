// Common interfaces shared between main and renderer processes

// Generic API Response interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    name: string;
    message: string;
    code?: string;
    issues?: Record<string, string[]>;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
    pagination?: PaginationMetadata;
  };
}

// Pagination interfaces
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Filter and sort interfaces
export interface SortParams {
  field: string;
  direction: "asc" | "desc";
}

export interface FilterParams {
  search?: string;
  filters?: Record<string, string | number | boolean>;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Entity metadata interface
export interface EntityMetadata {
  id: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// IPC communication interfaces
export interface IpcRequest<T = unknown> {
  id: string;
  channel: string;
  data?: T;
  timestamp: string;
}

export interface IpcResponse<T = unknown> {
  id: string;
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Window state interface
export interface WindowState {
  isMaximized: boolean;
  isMinimized: boolean;
  isFullscreen: boolean;
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Application configuration interface
export interface AppConfig {
  theme: "light" | "dark" | "system";
  language: string;
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
  autoSave: boolean;
  debugMode: boolean;
}

// File system interfaces
export interface FileInfo {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: Date;
  extension: string;
}

export interface DirectoryInfo {
  name: string;
  path: string;
  files: FileInfo[];
  subdirectories: DirectoryInfo[];
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Search interfaces
export interface SearchParams {
  query: string;
  filters?: FilterParams;
  sort?: SortParams;
  pagination?: PaginationParams;
}

export interface SearchResult<T> {
  items: T[];
  totalCount: number;
  query: string;
  executionTime: number;
  pagination: PaginationMetadata;
}

// Event interfaces
export interface BaseEvent {
  id: string;
  type: string;
  timestamp: Date;
  source: string;
}

export interface UserAction extends BaseEvent {
  userId: string;
  action: string;
  context?: Record<string, string | number | boolean>;
}

// Notification interfaces
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: string;
  data?: Record<string, unknown>;
}
