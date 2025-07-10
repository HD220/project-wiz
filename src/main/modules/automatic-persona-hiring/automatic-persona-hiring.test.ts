import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { HirePersonasAutomaticallyCommand } from "@/main/modules/automatic-persona-hiring/application/commands/hire-personas-automatically.command";
import { HirePersonasAutomaticallyCommandHandler } from "@/main/modules/automatic-persona-hiring/application/commands/hire-personas-automatically.command";
import { AnalyzeProjectStackQuery } from "@/main/modules/code-analysis/application/queries/analyze-project-stack.query";
import { GetLlmConfigQuery } from "@/main/modules/llm-integration/application/queries/get-llm-config.query";
import { CreatePersonaCommand } from "@/main/modules/persona-management/application/commands/create-persona.command";
import { Persona } from "@/main/modules/persona-management/domain/persona.entity";
import { LlmConfig } from "@/main/modules/llm-integration/domain/llm-config.entity";

describe("Automatic Persona Hiring Module", () => {
  let cqrsDispatcher: CqrsDispatcher;
  let mockLlmConfig: LlmConfig | undefined;

  beforeEach(() => {
    cqrsDispatcher = new CqrsDispatcher();
    mockLlmConfig = new LlmConfig(
      {
        provider: "openai",
        model: "gpt-4",
        apiKey: "test-key",
        temperature: 0.7,
        maxTokens: 2000,
      },
      "llm-config-id",
    );

    // Mock AnalyzeProjectStackQueryHandler
    cqrsDispatcher.registerQueryHandler(
      "AnalyzeProjectStackQuery",
      async (query: AnalyzeProjectStackQuery) => {
        if (query.payload.projectPath.includes("react")) {
          return {
            languages: { TypeScript: 0.8 },
            frameworks: ["React"],
            libraries: ["Redux"],
          };
        }
        if (query.payload.projectPath.includes("node")) {
          return {
            languages: { JavaScript: 1.0 },
            frameworks: ["Express.js"],
            libraries: ["Mongoose"],
          };
        }
        return { languages: { Unknown: 1.0 }, frameworks: [], libraries: [] };
      },
    );

    // Default mock for GetLlmConfigQuery to return a valid config
    cqrsDispatcher.registerQueryHandler(
      "GetLlmConfigQuery",
      async (query: GetLlmConfigQuery) => {
        if (
          query.payload.provider === "openai" &&
          query.payload.model === "gpt-4"
        ) {
          return mockLlmConfig;
        }
        return undefined;
      },
    );

    // Mock CreatePersonaCommand (spy on it)
    cqrsDispatcher.registerCommandHandler(
      "CreatePersonaCommand",
      async (command: CreatePersonaCommand) => {
        // In a real scenario, this would save to DB. Here, we just return a mock persona.
        return new Persona(
          {
            name: command.payload.name,
            description: command.payload.description,
            llmConfig: {
              model: command.payload.llmModel,
              temperature: command.payload.llmTemperature,
            },
            tools: command.payload.tools,
          },
          "mock-persona-id",
        );
      },
    );

    const hirePersonasAutomaticallyCommandHandler =
      new HirePersonasAutomaticallyCommandHandler(cqrsDispatcher);
    cqrsDispatcher.registerCommandHandler(
      "HirePersonasAutomaticallyCommand",
      hirePersonasAutomaticallyCommandHandler.handle.bind(
        hirePersonasAutomaticallyCommandHandler,
      ),
    );
  });

  it("should hire personas automatically based on project stack (React)", async () => {
    const command = new HirePersonasAutomaticallyCommand({
      projectId: "proj1",
      projectPath: "/user/projects/my-react-app",
    });
    const result = await cqrsDispatcher.dispatchCommand<
      HirePersonasAutomaticallyCommand,
      boolean
    >(command);

    expect(result).toBe(true);
  });

  it("should hire personas automatically based on project stack (Node.js)", async () => {
    const command = new HirePersonasAutomaticallyCommand({
      projectId: "proj2",
      projectPath: "/user/projects/my-node-api",
    });
    const result = await cqrsDispatcher.dispatchCommand<
      HirePersonasAutomaticallyCommand,
      boolean
    >(command);

    expect(result).toBe(true);
  });

  it("should handle cases where LLM config is not found", async () => {
    mockLlmConfig = undefined;

    const command = new HirePersonasAutomaticallyCommand({
      projectId: "proj3",
      projectPath: "/user/projects/any-app",
    });

    await expect(
      cqrsDispatcher.dispatchCommand<HirePersonasAutomaticallyCommand, boolean>(
        command,
      ),
    ).rejects.toThrow("Failed to get LLM config for persona suggestion.");
  });
});
