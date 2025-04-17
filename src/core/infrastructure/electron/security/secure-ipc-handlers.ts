import { ipcMain } from 'electron';
import { sanitizeIpcInput } from './electron-security-config';
import { HistoryServiceImpl } from '../history-service';
import { saveToken, removeToken, hasToken } from '../github-token-manager';

type IpcHandler = (event: Electron.IpcMainInvokeEvent, ...args: any[]) => Promise<any>;

export function registerSecureHistoryHandlers(historyService: HistoryServiceImpl) {
  const handlers: Record<string, IpcHandler> = {
    'history:createConversation': async (_, title?: string) => {
      const sanitizedTitle = sanitizeIpcInput(title) as string | undefined;
      return historyService.createConversation(sanitizedTitle);
    },
    'history:addMessage': async (_, conversationId: string, role: string, content: string) => {
      const sanitized = {
        conversationId: sanitizeIpcInput(conversationId) as string,
        role: ['user', 'assistant'].includes(role) ? role as 'user' | 'assistant' : 'user',
        content: sanitizeIpcInput(content) as string
      };
      return historyService.addMessage(sanitized.conversationId, sanitized.role, sanitized.content);
    }
  };

  Object.entries(handlers).forEach(([channel, handler]) => {
    ipcMain.handle(channel, handler);
  });
}

export function registerSecureGitHubTokenHandlers() {
  const handlers: Record<string, IpcHandler> = {
    'githubToken:save': async (_, token: string) => {
      const sanitizedToken = sanitizeIpcInput(token) as string;
      return saveToken(sanitizedToken);
    },
    'githubToken:remove': () => removeToken(),
    'githubToken:status': () => hasToken()
  };

  Object.entries(handlers).forEach(([channel, handler]) => {
    ipcMain.handle(channel, handler);
  });
}