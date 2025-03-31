import { SecurityPolicyManager } from "../__backup__/SecurityPolicyManager";
import type { IPCMessage } from "../ipc";

describe("SecurityPolicyManager", () => {
  let policyManager: SecurityPolicyManager;

  beforeEach(() => {
    policyManager = new SecurityPolicyManager();
  });

  it("should create with default policy", () => {
    const policy = policyManager.getCurrentPolicy();

    expect(policy.sandbox.enabled).toBe(true);
    expect(policy.sandbox.nodeIntegration).toBe(false);
    expect(policy.sandbox.contextIsolation).toBe(true);
    expect(policy.allowedAPIs).toContain("llm");
    expect(policy.allowedAPIs).toContain("ipc");
    expect(policy.resourceLimits.cpu.maxUsage).toBe(80);
    expect(policy.resourceLimits.memory.maxMB).toBe(1024);
  });

  it("should validate allowed messages", () => {
    const validMessage: IPCMessage = {
      id: "123",
      channel: "llm:query",
      payload: { prompt: "test" },
    };

    const invalidMessage1 = {
      id: "456",
      channel: "fs:write", // Não permitido
      payload: { path: "/etc/passwd" },
    };

    const invalidMessage2 = {
      notAChannel: "llm:query", // Estrutura inválida
      payload: {},
    };

    expect(policyManager.validateMessage(validMessage)).toBe(true);
    expect(policyManager.validateMessage(invalidMessage1)).toBe(false);
    expect(policyManager.validateMessage(invalidMessage2)).toBe(false);
  });

  it("should update policies correctly", () => {
    policyManager.updatePolicy({
      allowedAPIs: ["llm"],
      resourceLimits: {
        cpu: { maxUsage: 50 },
        memory: { maxMB: 512 },
      },
    });

    const updatedPolicy = policyManager.getCurrentPolicy();

    expect(updatedPolicy.allowedAPIs).toEqual(["llm"]);
    expect(updatedPolicy.resourceLimits.cpu.maxUsage).toBe(50);
    expect(updatedPolicy.resourceLimits.memory.maxMB).toBe(512);
    // Campos não atualizados devem manter os valores padrão
    expect(updatedPolicy.sandbox.enabled).toBe(true);
  });

  it("should block messages from unauthorized APIs", () => {
    const systemMessage = {
      id: "789",
      channel: "system:shutdown",
      payload: {},
    };

    expect(policyManager.validateMessage(systemMessage)).toBe(false);
  });
});
