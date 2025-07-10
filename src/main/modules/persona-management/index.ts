import type { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { createIpcHandler } from "@/main/kernel/ipc-handler-utility";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import type { IPersona } from "@/shared/ipc-types/domain-types";
import type {
  IpcPersonaRefineSuggestionPayload,
  IpcPersonaCreatePayload,
  IpcPersonaListPayload,
  IpcPersonaRemovePayload,
} from "@/shared/ipc-types/ipc-payloads";
import { RefinePersonaSuggestionCommand, RefinePersonaSuggestionHandler } from "./application/commands/refine-persona-suggestion.command";
import { CreatePersonaCommand, CreatePersonaCommandHandler } from "./application/commands/create-persona.command";
import { ListPersonasQuery, ListPersonasQueryHandler } from "./application/queries/list-personas.query";
import { RemovePersonaCommand, RemovePersonaCommandHandler } from "./application/commands/remove-persona.command";
import { GetPersonaQuery, GetPersonaQueryHandler } from "./application/queries/get-persona.query";
import { DrizzlePersonaRepository } from "./persistence/drizzle-persona.repository";
import { OpenAILLMAdapter } from "@/main/modules/llm-integration/infrastructure/openai-llm.adapter";
import { db } from "@/main/persistence/db";

export function registerPersonaManagementModule(
  cqrsDispatcher: CqrsDispatcher,
) {
  const personaRepository = new DrizzlePersonaRepository(db);
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

  cqrsDispatcher.registerCommandHandler<RefinePersonaSuggestionCommand, IPersona>(
    RefinePersonaSuggestionCommand.name,
    refinePersonaSuggestionHandler.execute.bind(refinePersonaSuggestionHandler),
  );
  cqrsDispatcher.registerCommandHandler<CreatePersonaCommand, IPersona>(
    CreatePersonaCommand.name,
    createPersonaCommandHandler.handle.bind(createPersonaCommandHandler),
  );
  cqrsDispatcher.registerQueryHandler<ListPersonasQuery, IPersona[]>(
    ListPersonasQuery.name,
    listPersonasQueryHandler.handle.bind(listPersonasQueryHandler),
  );
  cqrsDispatcher.registerQueryHandler<GetPersonaQuery, IPersona | undefined>(
    GetPersonaQuery.name,
    getPersonaQueryHandler.handle.bind(getPersonaQueryHandler),
  );
  cqrsDispatcher.registerCommandHandler<RemovePersonaCommand, boolean>(
    RemovePersonaCommand.name,
    removePersonaCommandHandler.handle.bind(removePersonaCommandHandler),
  );

  createIpcHandler<IpcPersonaRefineSuggestionPayload, IPersona>(
    IpcChannel.PERSONA_REFINE_SUGGESTION,
    cqrsDispatcher,
    async (payload) => {
      const result = (await cqrsDispatcher.dispatchCommand(
        new RefinePersonaSuggestionCommand(payload),
      )) as IPersona;
      return result;
    },
  );

  createIpcHandler<IpcPersonaCreatePayload, IPersona>(
    IpcChannel.PERSONA_CREATE,
    cqrsDispatcher,
    async (payload) => {
      const persona = (await cqrsDispatcher.dispatchCommand(
        new CreatePersonaCommand(payload),
      )) as IPersona;
      return persona;
    },
  );

  createIpcHandler<IpcPersonaListPayload, IPersona[]>(
    IpcChannel.PERSONA_LIST,
    cqrsDispatcher,
    async (payload) => {
      const personas = (await cqrsDispatcher.dispatchQuery(
        new ListPersonasQuery(payload),
      )) as IPersona[];
      return personas;
    },
  );

  createIpcHandler<IpcPersonaRemovePayload, boolean>(
    IpcChannel.PERSONA_REMOVE,
    cqrsDispatcher,
    async (payload) => {
      const result = (await cqrsDispatcher.dispatchCommand(
        new RemovePersonaCommand(payload),
      )) as boolean;
      return result;
    },
  );
}

