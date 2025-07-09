import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { CreatePersonaCommand } from "@/main/modules/persona-management/application/commands/create-persona.command";
import { ListPersonasQuery } from "@/main/modules/persona-management/application/queries/list-personas.query";
import { DrizzlePersonaRepository } from "@/main/modules/persona-management/persistence/drizzle-persona.repository";
import { Persona } from "@/main/modules/persona-management/domain/persona.entity";
import { personas } from "@/main/modules/persona-management/persistence/schema";
import { db } from "@/main/persistence/db";
import { sql } from "drizzle-orm";
import { CreatePersonaCommandHandler } from "@/main/modules/persona-management/application/commands/create-persona.command";
import { ListPersonasQueryHandler } from "@/main/modules/persona-management/application/queries/list-personas.query";

describe("Persona Management Module - Create Persona", () => {
  let cqrsDispatcher: CqrsDispatcher;
  let personaRepository: DrizzlePersonaRepository;

  

  beforeAll(() => {
    cqrsDispatcher = new CqrsDispatcher();
    personaRepository = new DrizzlePersonaRepository();

    const createPersonaCommandHandler = new CreatePersonaCommandHandler(personaRepository);
    const listPersonasQueryHandler = new ListPersonasQueryHandler(personaRepository);

    cqrsDispatcher.registerCommandHandler("CreatePersonaCommand", createPersonaCommandHandler.handle.bind(createPersonaCommandHandler));
    cqrsDispatcher.registerQueryHandler("ListPersonasQuery", listPersonasQueryHandler.handle.bind(listPersonasQueryHandler));
  });

  beforeEach(async () => {
    
  });

  it("should create a new persona", async () => {
    const command = new CreatePersonaCommand({
      name: "Test Persona",
      description: "A persona for testing",
      llmModel: "gpt-4",
      llmTemperature: 0.7,
      tools: ["tool1", "tool2"],
    });
    const createdPersona = await cqrsDispatcher.dispatchCommand<CreatePersonaCommand, Persona>(command);

    expect(createdPersona).toBeInstanceOf(Persona);
    expect(createdPersona.name).toBe("Test Persona");

    const listedPersonas = await cqrsDispatcher.dispatchQuery<ListPersonasQuery, Persona[]>(new ListPersonasQuery());
    expect(listedPersonas.length).toBe(1);
    expect(listedPersonas[0].name).toBe("Test Persona");
  });
});
