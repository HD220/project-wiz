import { SessionServicePort } from "../../domain/ports/session-service.port";

export class ResumeSessionUseCase {
  constructor(private readonly sessionService: SessionServicePort) {}

  async execute(sessionId: string): Promise<void> {
    return this.sessionService.resumeSession(sessionId);
  }
}