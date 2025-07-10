import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { ApplicationError } from "@/main/errors/application.error";
import { Persona } from "@/main/modules/persona-management/domain/persona.entity";
import { IPersonaRepository } from "@/main/modules/persona-management/domain/persona.repository";

export interface ICreatePersonaCommandPayload {
  name: string;
  description: string;
  llmModel: string;
  llmTemperature: number;
  tools: string[];
}

export class CreatePersonaCommand
  implements ICommand<ICreatePersonaCommandPayload>
{
  readonly type = "CreatePersonaCommand";
  constructor(public payload: ICreatePersonaCommandPayload) {}
}

export class CreatePersonaCommandHandler {
  constructor(private personaRepository: IPersonaRepository) {}

  async handle(command: CreatePersonaCommand): Promise<Persona> {
    const persona = new Persona({
      name: command.payload.name,
      description: command.payload.description,
      llmConfig: {
        model: command.payload.llmModel,
        temperature: command.payload.llmTemperature,
      },
      tools: command.payload.tools,
    });
    try {
      return await this.personaRepository.save(persona);
    } catch (error) {
      console.error(`Failed to create persona:`, error);
      throw new ApplicationError(`Failed to create persona: ${(error as Error).message}`);
    }
  }
}
