import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { GetPersonaQuery } from "@/main/modules/persona-management/application/queries/get-persona.query";
import { Persona } from "@/main/modules/persona-management/domain/persona.entity";
import { AgentProcess } from '@/main/kernel/agent-runtime/agent-process';

describe("Agent Runtime Module", () => {
  let cqrsDispatcher: CqrsDispatcher;
  let agentProcess: AgentProcess;

  beforeEach(() => {
    cqrsDispatcher = new CqrsDispatcher();
    // Mock the GetPersonaQueryHandler
    cqrsDispatcher.registerQueryHandler("GetPersonaQuery", async (query: GetPersonaQuery): Promise<Persona | undefined> => {
      if (query.payload.id === "test-persona-id") {
        return new Persona({ name: "Test Agent", description: "A test persona", llmConfig: { model: "gpt-4", temperature: 0.7 }, tools: [] }, "test-persona-id");
      }
      return undefined;
    });
    agentProcess = new AgentProcess("test-persona-id", cqrsDispatcher);
  });

  it("should start and stop the agent process", async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    agentProcess.start();
    // Give it a moment to start and run one loop iteration
    await new Promise(resolve => setTimeout(resolve, 1100));
    agentProcess.stop();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Agent process for Persona test-persona-id started."));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Agent process for Persona test-persona-id stopped."));
    consoleSpy.mockRestore();
  });

  it("should log an error and stop if persona cannot be loaded", async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');
    const invalidAgentProcess = new AgentProcess("invalid-persona-id", cqrsDispatcher);
    invalidAgentProcess.start();
    await new Promise(resolve => setTimeout(resolve, 1100));
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("Failed to load persona invalid-persona-id"));
    consoleErrorSpy.mockRestore();
  });
});
