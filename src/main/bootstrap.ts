import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { EventBus } from "@/main/kernel/event-bus";
import { db } from "@/main/persistence/db";

// Project Management
import {
  CreateProjectCommand,
  CreateProjectCommandHandler,
} from "@/main/modules/project-management/application/commands/create-project.command";
import {
  RemoveProjectCommand,
  RemoveProjectCommandHandler,
} from "@/main/modules/project-management/application/commands/remove-project.command";
import {
  ListProjectsQuery,
  ListProjectsQueryHandler,
} from "@/main/modules/project-management/application/queries/list-projects.query";
import { Project } from "@/main/modules/project-management/domain/project.entity";
import { DrizzleProjectRepository } from "@/main/modules/project-management/persistence/drizzle-project.repository";

// Direct Messages
import {
  SendMessageCommand,
  SendMessageCommandHandler,
} from "@/main/modules/direct-messages/application/commands/send-message.command";
import {
  ListMessagesQuery,
  ListMessagesQueryHandler,
} from "@/main/modules/direct-messages/application/queries/list-messages.query";
import { DirectMessage } from "@/main/modules/direct-messages/domain/direct-message.entity";
import { DrizzleDirectMessageRepository } from "@/main/modules/direct-messages/persistence/drizzle-direct-message.repository";

// User Settings
import {
  SaveUserSettingCommand,
  SaveUserSettingCommandHandler,
} from "@/main/modules/user-settings/application/commands/save-user-setting.command";
import {
  GetUserSettingQuery,
  GetUserSettingQueryHandler,
} from "@/main/modules/user-settings/application/queries/get-user-setting.query";
import {
  ListUserSettingsQuery,
  ListUserSettingsQueryHandler,
} from "@/main/modules/user-settings/application/queries/list-user-settings.query";
import { UserSetting } from "@/main/modules/user-settings/domain/user-setting.entity";
import { DrizzleUserSettingsRepository } from "@/main/modules/user-settings/persistence/drizzle-user-settings.repository";

// Persona Management
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

// LLM Integration
import {
  SaveLlmConfigCommand,
  SaveLlmConfigCommandHandler,
} from "@/main/modules/llm-integration/application/commands/save-llm-config.command";
import {
  GetLlmConfigQuery,
  GetLlmConfigQueryHandler,
} from "@/main/modules/llm-integration/application/queries/get-llm-config.query";
import {
  ListLlmConfigsQuery,
  ListLlmConfigsQueryHandler,
} from "@/main/modules/llm-integration/application/queries/list-llm-configs.query";
import {
  RemoveLlmConfigCommand,
  RemoveLlmConfigCommandHandler,
} from "@/main/modules/llm-integration/application/commands/remove-llm-config.command";
import { LlmConfig } from "@/main/modules/llm-integration/domain/llm-config.entity";
import { DrizzleLlmConfigRepository } from "@/main/modules/llm-integration/persistence/drizzle-llm-config.repository";
import { OpenAILLMAdapter } from "@/main/modules/llm-integration/infrastructure/openai-llm.adapter";

// Code Analysis
import {
  AnalyzeProjectStackQuery,
  AnalyzeProjectStackQueryHandler,
} from "@/main/modules/code-analysis/application/queries/analyze-project-stack.query";
import { ProjectStack } from "@/main/modules/code-analysis/domain/project-stack.entity";

// Automatic Persona Hiring
import {
  HirePersonasAutomaticallyCommand,
  HirePersonasAutomaticallyCommandHandler,
} from "@/main/modules/automatic-persona-hiring/application/commands/hire-personas-automatically.command";

// Modules
import { registerGitIntegrationModule } from "./modules/git-integration";
import { registerFilesystemToolsModule } from "./modules/filesystem-tools";

function registerProjectHandlers(
  cqrsDispatcher: CqrsDispatcher,
  projectRepository: DrizzleProjectRepository,
  createProjectCommandHandler: CreateProjectCommandHandler,
  listProjectsQueryHandler: ListProjectsQueryHandler,
  removeProjectCommandHandler: RemoveProjectCommandHandler,
) {
  cqrsDispatcher.registerCommandHandler<CreateProjectCommand, Project>(
    "CreateProjectCommand",
    createProjectCommandHandler.handle.bind(createProjectCommandHandler),
  );
  cqrsDispatcher.registerQueryHandler<ListProjectsQuery, Project[]>(
    "ListProjectsQuery",
    listProjectsQueryHandler.handle.bind(listProjectsQueryHandler),
  );
  cqrsDispatcher.registerCommandHandler<RemoveProjectCommand, boolean>(
    "RemoveProjectCommand",
    removeProjectCommandHandler.handle.bind(removeProjectCommandHandler),
  );
}

function registerDirectMessageHandlers(
  cqrsDispatcher: CqrsDispatcher,
  directMessageRepository: DrizzleDirectMessageRepository,
  sendMessageCommandHandler: SendMessageCommandHandler,
  listMessagesQueryHandler: ListMessagesQueryHandler,
) {
  cqrsDispatcher.registerCommandHandler<SendMessageCommand, DirectMessage>(
    "SendMessageCommand",
    sendMessageCommandHandler.handle.bind(sendMessageCommandHandler),
  );
  cqrsDispatcher.registerQueryHandler<ListMessagesQuery, DirectMessage[]>(
    "ListMessagesQuery",
    listMessagesQueryHandler.handle.bind(listMessagesQueryHandler),
  );
}

function registerUserSettingsHandlers(
  cqrsDispatcher: CqrsDispatcher,
  userSettingsRepository: DrizzleUserSettingsRepository,
  saveUserSettingCommandHandler: SaveUserSettingCommandHandler,
  getUserSettingQueryHandler: GetUserSettingQueryHandler,
  listUserSettingsQueryHandler: ListUserSettingsQueryHandler,
) {
  cqrsDispatcher.registerCommandHandler<SaveUserSettingCommand, UserSetting>(
    "SaveUserSettingCommand",
    saveUserSettingCommandHandler.handle.bind(saveUserSettingCommandHandler),
  );
  cqrsDispatcher.registerQueryHandler<
    GetUserSettingQuery,
    UserSetting | undefined
  >(
    "GetUserSettingQuery",
    getUserSettingQueryHandler.handle.bind(getUserSettingQueryHandler),
  );
  cqrsDispatcher.registerQueryHandler<ListUserSettingsQuery, UserSetting[]>(
    "ListUserSettingsQuery",
    listUserSettingsQueryHandler.handle.bind(listUserSettingsQueryHandler),
  );
}

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

function registerLlmConfigHandlers(
  cqrsDispatcher: CqrsDispatcher,
  llmConfigRepository: DrizzleLlmConfigRepository,
  saveLlmConfigCommandHandler: SaveLlmConfigCommandHandler,
  getLlmConfigQueryHandler: GetLlmConfigQueryHandler,
  listLlmConfigsQueryHandler: ListLlmConfigsQueryHandler,
  removeLlmConfigCommandHandler: RemoveLlmConfigCommandHandler,
) {
  cqrsDispatcher.registerCommandHandler<SaveLlmConfigCommand, LlmConfig>(
    "SaveLlmConfigCommand",
    saveLlmConfigCommandHandler.handle.bind(saveLlmConfigCommandHandler),
  );
  cqrsDispatcher.registerQueryHandler<GetLlmConfigQuery, LlmConfig | undefined>(
    "GetLlmConfigQuery",
    getLlmConfigQueryHandler.handle.bind(getLlmConfigQueryHandler),
  );
  cqrsDispatcher.registerQueryHandler<ListLlmConfigsQuery, LlmConfig[]>(
    "ListLlmConfigsQuery",
    listLlmConfigsQueryHandler.handle.bind(listLlmConfigsQueryHandler),
  );
  cqrsDispatcher.registerCommandHandler<RemoveLlmConfigCommand, boolean>(
    "RemoveLlmConfigCommand",
    removeLlmConfigCommandHandler.handle.bind(removeLlmConfigCommandHandler),
  );
}

function registerCodeAnalysisHandlers(
  cqrsDispatcher: CqrsDispatcher,
  analyzeProjectStackQueryHandler: AnalyzeProjectStackQueryHandler,
) {
  cqrsDispatcher.registerQueryHandler<AnalyzeProjectStackQuery, ProjectStack>(
    "AnalyzeProjectStackQuery",
    analyzeProjectStackQueryHandler.handle.bind(
      analyzeProjectStackQueryHandler,
    ),
  );
}

function registerAutomaticPersonaHiringHandlers(
  cqrsDispatcher: CqrsDispatcher,
  hirePersonasAutomaticallyCommandHandler: HirePersonasAutomaticallyCommandHandler,
) {
  cqrsDispatcher.registerCommandHandler<
    HirePersonasAutomaticallyCommand,
    boolean
  >(
    "HirePersonasAutomaticallyCommand",
    hirePersonasAutomaticallyCommandHandler.handle.bind(
      hirePersonasAutomaticallyCommandHandler,
    ),
  );
}

function initializeProjectManagement(cqrsDispatcher: CqrsDispatcher) {
  const projectRepository = new DrizzleProjectRepository();
  const createProjectCommandHandler = new CreateProjectCommandHandler(
    projectRepository,
  );
  const listProjectsQueryHandler = new ListProjectsQueryHandler(
    projectRepository,
  );
  const removeProjectCommandHandler = new RemoveProjectCommandHandler(
    projectRepository,
  );

  registerProjectHandlers(
    cqrsDispatcher,
    projectRepository,
    createProjectCommandHandler,
    listProjectsQueryHandler,
    removeProjectCommandHandler,
  );
}

function initializeDirectMessages(cqrsDispatcher: CqrsDispatcher) {
  const directMessageRepository = new DrizzleDirectMessageRepository();
  const sendMessageCommandHandler = new SendMessageCommandHandler(
    directMessageRepository,
  );
  const listMessagesQueryHandler = new ListMessagesQueryHandler(
    directMessageRepository,
  );

  registerDirectMessageHandlers(
    cqrsDispatcher,
    directMessageRepository,
    sendMessageCommandHandler,
    listMessagesQueryHandler,
  );
}

function initializeUserSettings(cqrsDispatcher: CqrsDispatcher) {
  const userSettingsRepository = new DrizzleUserSettingsRepository();
  const saveUserSettingCommandHandler = new SaveUserSettingCommandHandler(
    userSettingsRepository,
  );
  const getUserSettingQueryHandler = new GetUserSettingQueryHandler(
    userSettingsRepository,
  );
  const listUserSettingsQueryHandler = new ListUserSettingsQueryHandler(
    userSettingsRepository,
  );

  registerUserSettingsHandlers(
    cqrsDispatcher,
    userSettingsRepository,
    saveUserSettingCommandHandler,
    getUserSettingQueryHandler,
    listUserSettingsQueryHandler,
  );
}

function initializePersonaManagement(cqrsDispatcher: CqrsDispatcher) {
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

function initializeLlmIntegration(cqrsDispatcher: CqrsDispatcher) {
  const llmConfigRepository = new DrizzleLlmConfigRepository();
  const saveLlmConfigCommandHandler = new SaveLlmConfigCommandHandler(
    llmConfigRepository,
  );
  const getLlmConfigQueryHandler = new GetLlmConfigQueryHandler(
    llmConfigRepository,
  );
  const listLlmConfigsQueryHandler = new ListLlmConfigsQueryHandler(
    llmConfigRepository,
  );
  const removeLlmConfigCommandHandler = new RemoveLlmConfigCommandHandler(
    llmConfigRepository,
  );

  registerLlmConfigHandlers(
    cqrsDispatcher,
    llmConfigRepository,
    saveLlmConfigCommandHandler,
    getLlmConfigQueryHandler,
    listLlmConfigsQueryHandler,
    removeLlmConfigCommandHandler,
  );
}

function initializeCodeAnalysis(cqrsDispatcher: CqrsDispatcher) {
  const analyzeProjectStackQueryHandler = new AnalyzeProjectStackQueryHandler();

  registerCodeAnalysisHandlers(cqrsDispatcher, analyzeProjectStackQueryHandler);
}

function initializeAutomaticPersonaHiring(cqrsDispatcher: CqrsDispatcher) {
  const hirePersonasAutomaticallyCommandHandler =
    new HirePersonasAutomaticallyCommandHandler(cqrsDispatcher);

  registerAutomaticPersonaHiringHandlers(
    cqrsDispatcher,
    hirePersonasAutomaticallyCommandHandler,
  );
}

export async function bootstrap() {
  const cqrsDispatcher = new CqrsDispatcher();
  const eventBus = new EventBus();

  // Initialize and register business modules
  initializeProjectManagement(cqrsDispatcher);
  initializeDirectMessages(cqrsDispatcher);
  initializeUserSettings(cqrsDispatcher);
  initializePersonaManagement(cqrsDispatcher);
  initializeLlmIntegration(cqrsDispatcher);
  initializeCodeAnalysis(cqrsDispatcher);
  initializeAutomaticPersonaHiring(cqrsDispatcher);

  registerGitIntegrationModule(cqrsDispatcher);
  registerFilesystemToolsModule(cqrsDispatcher);

  return {
    cqrsDispatcher,
    eventBus,
    db,
  };
}
