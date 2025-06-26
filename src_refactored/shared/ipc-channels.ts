// src_refactored/shared/ipc-channels.ts

/**
 * Defines standardized channel names for Electron IPC communication
 * throughout the refactored application.
 */
export const IPCChannel {
  // Chat Feature
  CHAT_SEND_MESSAGE: 'chat:sendMessage', // Renderer -> Main
  CHAT_STREAM_EVENT: 'chat:streamEvent', // Main -> Renderer (for streaming responses)

  // Onboarding Feature (example, to be defined in TSK-FE-IPC-ONBOARD if/when unblocked)
  // ONBOARDING_GET_USER: 'onboarding:getUser',
  // ONBOARDING_CREATE_USER: 'onboarding:createUser',
  // ONBOARDING_GET_LLM_PROVIDERS: 'onboarding:getLlmProviders',
  // ONBOARDING_CREATE_LLM_CONFIG: 'onboarding:createLlmConfig',

  // Generic/App level (example)
  // APP_GET_VERSION: 'app:getVersion',
} as const;

// Helper type to extract channel values
export type IPCChannelValue = typeof IPCChannel[keyof typeof IPCChannel];
