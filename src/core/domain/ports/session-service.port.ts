export interface SessionMetadata {
  repositoryId?: string;
  taskId?: string;
  workflow?: string;
}

export type SessionStatus = 'ativa' | 'pausada' | 'encerrada';

export interface Session {
  id: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  status: SessionStatus;
  metadata?: SessionMetadata;
}

export interface SessionFilter {
  status?: SessionStatus;
  repositoryId?: string;
  taskId?: string;
  workflow?: string;
}

export interface SessionServicePort {
  createSession(metadata: SessionMetadata, title?: string): Promise<Session>;
  pauseSession(sessionId: string): Promise<void>;
  resumeSession(sessionId: string): Promise<void>;
  endSession(sessionId: string): Promise<void>;
  listSessions(filter?: SessionFilter): Promise<Session[]>;
}