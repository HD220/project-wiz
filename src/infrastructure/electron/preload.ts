// src/infrastructure/electron/preload.ts
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'; // Added IpcRendererEvent
import { EnqueueJobInput } from '@/domain/use-cases/job/enqueue-job.use-case'; // For type safety
import { AIAgentProps } from '@/domain/entities/ai-agent.entity'; // For type safety
import { ChatMessage, RevisedLLMStreamEvent } from '@/domain/services/i-llm.service'; // Added

// Define the shape of the API that will be exposed to the renderer process
export interface IElectronAPI {
  enqueueJob: (jobInput: EnqueueJobInput) => Promise<{ success: boolean; data?: any; error?: string }>;
  listAIAgents: () => Promise<{ success: boolean; data?: AIAgentProps[]; error?: string }>;
  createAIAgent: (agentData: Omit<AIAgentProps, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; data?: AIAgentProps; error?: string }>;

  // Chat streaming methods
  sendMessageToAgent: (payload: { agentId: string; messages: ChatMessage[]; options?: Record<string, any> }) => Promise<{ success: boolean; data?: { jobId: string; message: string }; error?: string }>;
  onChatStreamEvent: (listener: (event: RevisedLLMStreamEvent) => void) => (() => void); // Returns an unsubscribe function

  // Add other IPC channels here as they are defined in main.ts
  // For example:
  // getJobStatus: (jobId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  // getAgentDetails: (agentId: string) => Promise<{ success: boolean; data?: AIAgentProps; error?: string }>;
  // updateAIAgent: (agentId: string, agentData: Partial<AIAgentProps>) => Promise<{ success: boolean; data?: AIAgentProps; error?: string }>;
  // deleteAIAgent: (agentId: string) => Promise<{ success: boolean; error?: string }>;

  // Example of exposing a listener (from main to renderer)
  // onAgentLog: (callback: (event: IpcRendererEvent, message: string) => void) => (() => void);
}

const exposedAPI: IElectronAPI = {
  enqueueJob: (jobInput) => ipcRenderer.invoke('enqueue-job', jobInput),
  listAIAgents: () => ipcRenderer.invoke('list-ai-agents'),
  createAIAgent: (agentData) => ipcRenderer.invoke('create-ai-agent', agentData),

  sendMessageToAgent: (payload) => ipcRenderer.invoke('chat:sendMessage', payload),
  onChatStreamEvent: (listener) => {
    const eventHandler = (event: IpcRendererEvent, streamEvent: RevisedLLMStreamEvent) => listener(streamEvent);
    ipcRenderer.on('chat:streamEvent', eventHandler);
    // Return an unsubscribe function
    return () => {
      ipcRenderer.removeListener('chat:streamEvent', eventHandler);
    };
  },
};

try {
  contextBridge.exposeInMainWorld('api', exposedAPI);
  console.log('[Preload] API exposed successfully to window.api');
} catch (error) {
  console.error('[Preload] Error exposing API:', error);
}

// It's also good practice to expose specific Electron utilities if needed,
// but only what's absolutely necessary for the renderer.
// For example, `platform`:
// contextBridge.exposeInMainWorld('electronUtils', {
//   platform: process.platform,
// });
