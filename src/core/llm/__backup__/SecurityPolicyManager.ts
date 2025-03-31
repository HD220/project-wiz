import type { IPCMessage } from "../ipc";

export interface SecurityPolicy {
  sandbox: {
    enabled: boolean;
    nodeIntegration: boolean;
    contextIsolation: boolean;
  };
  csp: {
    directives: string;
  };
  allowedAPIs: string[];
  resourceLimits: {
    cpu: {
      maxUsage: number; // 0-100%
    };
    memory: {
      maxMB: number;
    };
  };
}

export class SecurityPolicyManager {
  private static DEFAULT_POLICY: SecurityPolicy = {
    sandbox: {
      enabled: true,
      nodeIntegration: false,
      contextIsolation: true,
    },
    csp: {
      directives: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "connect-src 'self'",
      ].join("; "),
    },
    allowedAPIs: ["llm", "ipc", "fs:read"],
    resourceLimits: {
      cpu: {
        maxUsage: 80,
      },
      memory: {
        maxMB: 1024,
      },
    },
  };

  private currentPolicy: SecurityPolicy;

  constructor(customPolicy?: Partial<SecurityPolicy>) {
    this.currentPolicy = {
      ...SecurityPolicyManager.DEFAULT_POLICY,
      ...customPolicy,
    };
  }

  applyProcessPolicies(process: Electron.UtilityProcess): void {
    if (!process) return;

    // Aplica sandbox
    if (this.currentPolicy.sandbox.enabled) {
      process.postMessage({
        type: "set-sandbox",
        config: this.currentPolicy.sandbox,
      });
    }

    // Aplica CSP
    process.postMessage({
      type: "set-csp",
      directives: this.currentPolicy.csp.directives,
    });

    // Configura APIs permitidas
    process.postMessage({
      type: "set-allowed-apis",
      apis: this.currentPolicy.allowedAPIs,
    });

    // Configura limites de recursos
    process.postMessage({
      type: "set-resource-limits",
      limits: this.currentPolicy.resourceLimits,
    });
  }

  validateMessage(message: unknown): message is IPCMessage {
    if (typeof message !== "object" || message === null) return false;

    const msg = message as Record<string, unknown>;

    // Validação básica de estrutura
    if (!("channel" in msg) || typeof msg.channel !== "string") {
      return false;
    }

    // Validação de canal permitido
    const channelParts = msg.channel.split(":");
    const namespace = channelParts[0];

    if (!this.currentPolicy.allowedAPIs.includes(namespace)) {
      return false;
    }

    return true;
  }

  getCurrentPolicy(): Readonly<SecurityPolicy> {
    return this.currentPolicy;
  }

  updatePolicy(updates: Partial<SecurityPolicy>): void {
    this.currentPolicy = {
      ...this.currentPolicy,
      ...updates,
    };
  }
}
