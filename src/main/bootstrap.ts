import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { EventBus } from "@/main/kernel/event-bus";
import { db } from "@/main/persistence/db";

import { initializeProjectManagement } from "./initializers/project-management";
import { initializeDirectMessages } from "./initializers/direct-messages";
import { initializeUserSettings } from "./initializers/user-settings";
import { initializePersonaManagement } from "./initializers/persona-management";
import { initializeLlmIntegration } from "./initializers/llm-integration";
import { initializeCodeAnalysis } from "./initializers/code-analysis";
import { initializeAutomaticPersonaHiring } from "./initializers/automatic-persona-hiring";

// Modules
import { registerGitIntegrationModule } from "./modules/git-integration";
import { registerFilesystemToolsModule } from "./modules/filesystem-tools";





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
