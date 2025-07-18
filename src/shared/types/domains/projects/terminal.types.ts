export interface TerminalLine {
  id: string;
  content: string;
  type: "input" | "output" | "error";
  timestamp: Date;
  directory?: string;
  exitCode?: number;
}

export interface TerminalSession {
  id: string;
  projectId: string;
  name: string;
  directory: string;
  isActive: boolean;
  lastActivity: Date;
  lines: TerminalLine[];
}

export interface TerminalCommand {
  command: string;
  directory: string;
  environment?: Record<string, string>;
}

export interface TerminalCommandResponse {
  sessionId: string;
  lineId: string;
  output: string;
  exitCode: number;
  duration: number;
}
