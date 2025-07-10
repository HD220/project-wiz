import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import {
  CreatePersonaCommand,
  CreatePersonaCommandHandler,
} from "@/main/modules/persona-management/application/commands/create-persona.command";
import {
  ListPersonasQuery,
  ListPersonasQueryHandler,
} from "@/main/modules/persona-management/application/queries/list-personas.query";
import {
  GetPersonaQuery,
  GetPersonaQueryHandler,
} from "@/main/modules/persona-management/application/queries/get-persona.query";
import {
  RemovePersonaCommand,
  RemovePersonaCommandHandler,
} from "@/main/modules/persona-management/application/commands/remove-persona.command";
import { RefinePersonaSuggestionCommand } from "@/main/modules/persona-management/application/commands/refine-persona-suggestion.command";
import { RefinePersonaSuggestionHandler } from "@/main/modules/persona-management/application/commands/refine-persona-suggestion.handler";
import { Persona } from "@/main/modules/persona-management/domain/persona.entity";
import { DrizzlePersonaRepository } from "@/main/modules/persona-management/persistence/drizzle-persona.repository";
import { OpenAILLMAdapter } from "@/main/modules/llm-integration/infrastructure/openai-llm.adapter";

function registerPersonaHandlers(
  cqrsDispatcher: CqrsDispatcher,
  personaRepository: DrizzlePersonaRepository,
  createPersonaCommandHandler: CreatePersonaCommandHandler,
  listPersonasQueryHandler: ListPersonasQueryHandler,
  getPersonaQueryHandler: GetPersonaQueryHandler,
  removePersonaCommandHandler: RemovePersonaCommandHandler,
  refinePersonaSuggestionHandler: RefinePersonaSuggestionHandler,
) {
  cqrsDispatcher.registerCommandHandler<CreatePersonaCommand, Persona>(
    "CreatePersonaCommand",
    createPersonaCommandHandler.handle.bind(createPersonaCommandHandler),
  );
  cqrsDispatcher.registerQueryHandler<ListPersonasQuery, Persona[]>(
    "ListPersonasQuery",
    listPersonasQueryHandler.handle.bind(listPersonasQueryHandler),
  );
  cqrsDispatcher.registerQueryHandler<GetPersonaQuery, Persona | undefined>(
    "GetPersonaQuery",
    getPersonaQueryHandler.handle.bind(getPersonaQueryHandler),
  );
  cqrsDispatcher.registerCommandHandler<RemovePersonaCommand, boolean>(
    "RemovePersonaCommand",
    removePersonaCommandHandler.handle.bind(removePersonaCommandHandler),
  );
  cqrsDispatcher.registerCommandHandler<RefinePersonaSuggestionCommand, string>(
    "RefinePersonaSuggestionCommand",
    refinePersonaSuggestionHandler.execute.bind(refinePersonaSuggestionHandler),
  );
}

export function initializePersonaManagement(cqrsDispatcher: CqrsDispatcher) {
  const personaRepository = new DrizzlePersonaRepository();
  const createPersonaCommandHandler = new CreatePersonaCommandHandler(
    personaRepository,
  );
  const listPersonasQueryHandler = new ListPersonasQueryHandler(
    personaRepository,
  );
  const getPersonaQueryHandler = new GetPersonaQueryHandler(personaRepository);
  const removePersonaCommandHandler = new RemovePersonaCommandHandler(
    personaRepository,
  );
  const llmAdapter = new OpenAILLMAdapter();
  const refinePersonaSuggestionHandler = new RefinePersonaSuggestionHandler(
    llmAdapter,
  );

  registerPersonaHandlers(
    cqrsDispatcher,
    personaRepository,
    createPersonaCommandHandler,
    listPersonasQueryHandler,
    getPersonaQueryHandler,
    removePersonaCommandHandler,
    refinePersonaSuggestionHandler,
  );
}
