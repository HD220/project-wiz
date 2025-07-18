import { setupApiHandlers } from './api';

export function setupAllHandlers(): void {
  // Setup all IPC handlers using the new simplified API structure
  setupApiHandlers();
}

// Export all services for use in other parts of the application
export { AuthService } from './services/auth.service';
export { ProjectService } from './services/project.service';
export { AgentService } from './services/agent.service';
export { ChatService } from './services/chat.service';
export { ChannelService } from './services/channel.service';

// Export database utilities
export { getDatabase } from './database/connection';

// Export common types and schemas
export * from '../shared/types/common';
export * from '../shared/schemas/validation.schemas';