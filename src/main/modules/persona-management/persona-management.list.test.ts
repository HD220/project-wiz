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

describe("Persona Management Module - List Personas", () => {
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

  it("should list all personas", async () => {
    await cqrsDispatcher.dispatchCommand(new CreatePersonaCommand({
      name: "Persona 1",
      description: "Desc 1",
      llmModel: "gpt-3.5",
      llmTemperature: 0.5,
      tools: [],
    }));
    await cqrsDispatcher.dispatchCommand(new CreatePersonaCommand({
      name: "Persona 2",
      description: "Desc 2",
      llmModel: "claude-3",
      llmTemperature: 0.9,
      tools: ["toolA"],
    }));

    const listedPersonas = await cqrsDispatcher.dispatchQuery<ListPersonasQuery, Persona[]>(new ListPersonasQuery());

    expect(listedPersonas.length).toBe(2);
    expect(listedPersonas[0].name).toBe("Persona 1");
    expect(listedPersonas[1].name).toBe("Persona 2");
  });
});
