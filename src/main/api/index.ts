import { setupAuthHandlers } from './auth.handlers';
import { setupProjectHandlers } from './project.handlers';
import { setupAgentHandlers } from './agent.handlers';
import { setupMessageHandlers } from './message.handlers';
import { setupChannelHandlers } from './channel.handlers';

/**
 * Setup all IPC handlers
 */
export function setupApiHandlers(): void {
  console.log('Setting up IPC API handlers...');
  
  setupAuthHandlers();
  setupProjectHandlers();
  setupAgentHandlers();
  setupMessageHandlers();
  setupChannelHandlers();
  
  console.log('IPC API handlers setup complete');
}

// Export all handler setup functions for individual use if needed
export {
  setupAuthHandlers,
  setupProjectHandlers,
  setupAgentHandlers,
  setupMessageHandlers,
  setupChannelHandlers,
};