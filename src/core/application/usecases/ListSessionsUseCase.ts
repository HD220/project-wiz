import { Session, SessionFilter, SessionServicePort } from "../../domain/ports/session-service.port";

export class ListSessionsUseCase {
  constructor(private readonly sessionService: SessionServicePort) {}

  async execute(filter?: SessionFilter): Promise<Session[]> {
    return this.sessionService.listSessions(filter);
  }
}