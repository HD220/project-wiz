import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { EventBus } from "@/main/kernel/event-bus";
import { initializeDb } from "@/main/persistence/db";

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
    registerModuleFn(cqrsDispatcher);
  }

  return { cqrsDispatcher, eventBus, db };
}