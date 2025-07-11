import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { EventBus } from "@/main/kernel/event-bus";
import { initializeDb } from "@/main/persistence/db";
import logger from "@/main/logger";

// Import all module registration functions explicitly
import { registerProjectManagementModule } from "./modules/project-management";
import { registerDirectMessagesModule } from "./modules/direct-messages";
import { registerUserSettingsModule } from "./modules/user-settings";
import { registerPersonaManagementModule } from "./modules/persona-management";
import { registerLlmIntegrationModule } from "./modules/llm-integration";
import { registerCodeAnalysisModule } from "./modules/code-analysis";
import { registerAutomaticPersonaHiringModule } from "./modules/automatic-persona-hiring";
import { registerGitIntegrationModule } from "./modules/git-integration";
import { registerFilesystemToolsModule } from "./modules/filesystem-tools";
import { registerForumModule } from "./modules/forum";

// Import IPC handler registration functions
import { registerForumIpcHandlers } from "@/main/modules/forum/infrastructure/forum.handler";
import { registerProjectIpcHandlers } from "@/main/modules/project-management/infrastructure/project.handler";
import { registerDirectMessagesIpcHandlers } from "@/main/modules/direct-messages/infrastructure/direct-messages.handler";
import { registerPersonaIpcHandlers } from "@/main/modules/persona-management/infrastructure/persona.handler";
import { registerUserSettingsIpcHandlers } from "@/main/modules/user-settings/infrastructure/user-settings.handler";
import { registerLlmConfigIpcHandlers } from "@/main/modules/llm-integration/infrastructure/llm-config.handler";
import { registerCodeAnalysisIpcHandlers } from "@/main/modules/code-analysis/infrastructure/code-analysis.handler";
import { registerFilesystemIpcHandlers } from "@/main/modules/filesystem-tools/infrastructure/filesystem.handler";
import { registerGitIntegrationIpcHandlers } from "@/main/modules/git-integration/infrastructure/git-integration.handler";
import { registerAutomaticPersonaHiringIpcHandlers } from "@/main/modules/automatic-persona-hiring/infrastructure/automatic-persona-hiring.handler";

export async function bootstrap(
  cqrsDispatcher: CqrsDispatcher,
  eventBus: EventBus,
  db: ReturnType<typeof initializeDb>,
) {
  // Array of all module registration functions
  const moduleRegistrationFunctions = [
    registerProjectManagementModule,
    registerDirectMessagesModule,
    registerUserSettingsModule,
    registerPersonaManagementModule,
    registerLlmIntegrationModule,
    registerCodeAnalysisModule,
    registerAutomaticPersonaHiringModule,
    registerGitIntegrationModule,
    registerFilesystemToolsModule,
    registerForumModule,
  ];

  // Register all modules by iterating over the array
  for (const registerModuleFn of moduleRegistrationFunctions) {
    registerModuleFn(cqrsDispatcher, logger);
  }

  // Register all IPC handlers
  registerForumIpcHandlers(cqrsDispatcher);
  registerProjectIpcHandlers(cqrsDispatcher);
  registerDirectMessagesIpcHandlers(cqrsDispatcher);
  registerPersonaIpcHandlers(cqrsDispatcher);
  registerUserSettingsIpcHandlers(cqrsDispatcher);
  registerLlmConfigIpcHandlers(cqrsDispatcher);
  registerCodeAnalysisIpcHandlers(cqrsDispatcher);
  registerFilesystemIpcHandlers(cqrsDispatcher);
  registerGitIntegrationIpcHandlers(cqrsDispatcher);
  registerAutomaticPersonaHiringIpcHandlers(cqrsDispatcher);

  return { cqrsDispatcher, eventBus, db };
}