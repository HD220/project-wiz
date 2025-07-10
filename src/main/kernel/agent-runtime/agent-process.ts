import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { GetPersonaQuery } from "@/main/modules/persona-management/application/queries/get-persona.query";
import { Persona } from "@/main/modules/persona-management/domain/persona.entity";

export class AgentProcess {
  private running: boolean = false;
  private personaId: string;
  private cqrsDispatcher: CqrsDispatcher;

  constructor(personaId: string, cqrsDispatcher: CqrsDispatcher) {
    this.personaId = personaId;
    this.cqrsDispatcher = cqrsDispatcher;
  }

  public async start(): Promise<void> {
    this.running = true;
    console.log(`Agent process for Persona ${this.personaId} started.`);
    await this.runLoop();
  }

  public stop(): void {
    this.running = false;
    console.log(`Agent process for Persona ${this.personaId} stopped.`);
  }

  private async runLoop(): Promise<void> {
    while (this.running) {
      try {
        const persona: Persona | undefined =
          await this.cqrsDispatcher.dispatchQuery(
            new GetPersonaQuery({ id: this.personaId }),
          );

        if (persona) {
          console.log(`Agent ${persona.name} is processing jobs...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          console.error(
            `Failed to load persona ${this.personaId}: Persona not found.`,
          );
          this.stop();
        }
      } catch (error) {
        console.error(
          `Failed to load persona ${this.personaId}: ${(error as Error).message}`,
        );
        this.stop();
      }
    }
  }
}
