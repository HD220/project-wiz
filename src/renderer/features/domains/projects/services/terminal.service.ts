import type {
  TerminalSession,
  TerminalCommand,
  TerminalCommandResponse,
} from "@/shared/types/domains/projects/terminal.types";

export const terminalService = {
  async createSession(
    projectId: string,
    name: string,
    directory?: string,
  ): Promise<TerminalSession> {
    return window.api.terminal.createSession(projectId, name, directory);
  },

  async getSession(sessionId: string): Promise<TerminalSession | null> {
    return window.api.terminal.getSession(sessionId);
  },

  async getProjectSessions(projectId: string): Promise<TerminalSession[]> {
    return window.api.terminal.getProjectSessions(projectId);
  },

  async executeCommand(
    sessionId: string,
    command: TerminalCommand,
  ): Promise<TerminalCommandResponse> {
    return window.api.terminal.executeCommand(sessionId, command);
  },

  async closeSession(sessionId: string): Promise<{ success: boolean }> {
    return window.api.terminal.closeSession(sessionId);
  },

  async clearSession(sessionId: string): Promise<{ success: boolean }> {
    return window.api.terminal.clearSession(sessionId);
  },

  async getDefaultSessions(): Promise<TerminalSession[]> {
    return window.api.terminal.getDefaultSessions();
  },
};
