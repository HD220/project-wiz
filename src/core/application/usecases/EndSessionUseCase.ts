import { SessionServicePort } from "../../domain/ports/session-service.port";

export class EndSessionUseCase {
  constructor(private readonly sessionService: SessionServicePort) {}

  async execute(sessionId: string): Promise<void> {
    return this.sessionService.endSession(sessionId);
  }
}