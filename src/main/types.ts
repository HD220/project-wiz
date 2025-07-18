// Global types for main process

/**
 * Standard IPC response format
 * Used for all IPC communication between main and renderer processes
 */
export interface IpcResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
