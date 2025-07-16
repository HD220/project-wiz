// Re-export from centralized message types
// This file is kept for backward compatibility
export * from "./domains/common/message-core.types";

// Legacy type handler - consider removing in future refactor
export interface MessageTypeHandler {
  type: import("./domains/common/message-core.types").MessageType;
  content: string;
}
