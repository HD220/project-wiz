import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { CreatePersonaCommand } from "@/main/modules/persona-management/application/commands/create-persona.command";
import { ListPersonasQuery } from "@/main/modules/persona-management/application/queries/list-personas.query";
import { RemovePersonaCommand } from "@/main/modules/persona-management/application/commands/remove-persona.command";
import { DrizzlePersonaRepository } from "@/main/modules/persona-management/persistence/drizzle-persona.repository";
import { Persona } from "@/main/modules/persona-management/domain/persona.entity";
import { personas } from "@/main/modules/persona-management/persistence/schema";
import { db } from "@/main/persistence/db";
import { sql } from "drizzle-orm";
import { CreatePersonaCommandHandler } from "@/main/modules/persona-management/application/commands/create-persona.command";
import { ListPersonasQueryHandler } from "@/main/modules/persona-management/application/queries/list-personas.query";
import { RemovePersonaCommandHandler } from "@/main/modules/persona-management/application/commands/remove-persona.command";

describe("Persona Management Module - Remove Persona", () => {
  let cqrsDispatcher: CqrsDispatcher;
  let personaRepository: DrizzlePersonaRepository;

  

  beforeAll(() => {
    cqrsDispatcher = new CqrsDispatcher();
    personaRepository = new DrizzlePersonaRepository();

    const createPersonaCommandHandler = new CreatePersonaCommandHandler(personaRepository);
    const listPersonasQueryHandler = new ListPersonasQueryHandler(personaRepository);
    const removePersonaCommandHandler = new RemovePersonaCommandHandler(personaRepository);

    cqrsDispatcher.registerCommandHandler("CreatePersonaCommand", createPersonaCommandHandler.handle.bind(createPersonaCommandHandler));
    cqrsDispatcher.registerQueryHandler("ListPersonasQuery", listPersonasQueryHandler.handle.bind(listPersonasQueryHandler));
    cqrsDispatcher.registerCommandHandler("RemovePersonaCommand", removePersonaCommandHandler.handle.bind(removePersonaCommandHandler));
  });

  beforeEach(async () => {
    
  });

  it("should remove a persona", async () => {
    const createdPersona = await cqrsDispatcher.dispatchCommand<CreatePersonaCommand, Persona>(new CreatePersonaCommand({
      name: "Persona to Remove",
      description: "",
      llmModel: "gemini",
      llmTemperature: 0.1,
      tools: [],
    }));
    expect(createdPersona).toBeInstanceOf(Persona);

    const personaId = createdPersona.id;
    const removeCommand = new RemovePersonaCommand({ id: personaId });
    const removeResult = await cqrsDispatcher.dispatchCommand<RemovePersonaCommand, boolean>(removeCommand);

    expect(removeResult).toBe(true);

    const listedPersonas = await cqrsDispatcher.dispatchQuery<ListPersonasQuery, Persona[]>(new ListPersonasQuery());
    expect(listedPersonas.length).toBe(0);
  });

  it("should return false if persona to remove does not exist", async () => {
    const removeCommand = new RemovePersonaCommand({ id: "non-existent-id" });
    const removeResult = await cqrsDispatcher.dispatchCommand<RemovePersonaCommand, boolean>(removeCommand);

    expect(removeResult).toBe(false);
  });
});
