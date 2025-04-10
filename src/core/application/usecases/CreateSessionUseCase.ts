import { Session, SessionMetadata, SessionServicePort } from "../../domain/ports/session-service.port";

export class CreateSessionUseCase {
  constructor(private readonly sessionService: SessionServicePort) {}

  async execute(metadata: SessionMetadata, title?: string): Promise<Session> {
    return this.sessionService.createSession(metadata, title);
  }
}