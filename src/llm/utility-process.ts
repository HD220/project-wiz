import { utilityProcess } from "electron";
import { IPCManager } from "./ipc";
import { SecurityPolicyManager } from "./__backup__/SecurityPolicyManager";

import { HeartbeatMonitor } from "./heartbeat-monitor";
import { HEALTH_STATUS_CHANNEL } from "./types/heartbeat-config";
import { IPCMessage } from "./types/ipc-config";

export class UtilityProcessManager {
  private process: Electron.UtilityProcess | null = null;
  private ipcManager: IPCManager;
  private heartbeatMonitor: HeartbeatMonitor;

  constructor(ipcManager: IPCManager) {
    this.ipcManager = ipcManager;
    this.heartbeatMonitor = new HeartbeatMonitor({
      intervalMs: 3000,
      timeoutMs: 2000,
      maxRetries: 3,
    });

    this.setupHeartbeatHandlers();
  }

  async startProcess(): Promise<void> {
    if (this.process) {
      throw new Error("Process already running");
    }

    this.process = utilityProcess.fork(require.resolve("./worker"), [], {
      stdio: "pipe",
      serviceName: "llm-worker",
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || "production",
      },
    });

    this.setupSecurityPolicies();
    this.setupLifecycleHandlers();
    this.setupIPCCommunication();
    this.startHeartbeatMonitoring();
  }

  async stopProcess(): Promise<void> {
    if (!this.process) return;

    this.heartbeatMonitor.stopMonitoring();

    try {
      if (!this.process.kill()) {
        process.kill(this.process.pid!, "SIGKILL");
      }
    } finally {
      this.process = null;
    }
  }

  getProcessStatus(): "running" | "stopped" {
    return this.process ? "running" : "stopped";
  }

  private securityManager = new SecurityPolicyManager();

  private setupSecurityPolicies(): void {
    if (!this.process) return;

    // Aplica todas as políticas de segurança
    this.securityManager.applyProcessPolicies(this.process);

    // Validação de mensagens com políticas
    this.process.on("message", (message: unknown) => {
      if (!this.securityManager.validateMessage(message)) {
        console.warn("Blocked message - security policy violation:", message);
        return;
      }

      // Processa mensagens de configuração especial
      if (
        typeof message === "object" &&
        message !== null &&
        "type" in message
      ) {
        this.handleSecuritySetupMessage(message as Record<string, unknown>);
      }
    });
  }

  private handleSecuritySetupMessage(message: Record<string, unknown>): void {
    switch (message.type) {
      case "context-bridge-setup":
        this.process?.postMessage({
          type: "context-bridge-response",
          allowedAPIs: this.securityManager.getCurrentPolicy().allowedAPIs,
        });
        break;
      case "resource-usage-report":
        this.monitorResourceUsage(message.data);
        break;
    }
  }

  private monitorResourceUsage(data: unknown): void {
    // Implementar monitoramento de recursos
    console.log("Resource usage report:", data);
  }

  private isValidMessage(message: unknown): message is IPCMessage {
    return this.securityManager.validateMessage(message);
  }

  private setupLifecycleHandlers(): void {
    if (!this.process) return;

    this.process.on("exit", (code) => {
      console.log(`LLM Worker exited with code ${code}`);
      this.process = null;
    });

    this.process.on("spawn", () => {
      console.log("LLM Worker spawned successfully");
    });

    this.process.on("error", (error) => {
      console.error("LLM Worker error:", error);
      this.process = null;
    });
  }

  private startHeartbeatMonitoring(): void {
    this.heartbeatMonitor.startMonitoring(async () => {
      if (!this.process) return false;

      return new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => resolve(false), 1000);

        this.process?.once("message", (msg) => {
          if (msg?.type === "heartbeat-response") {
            clearTimeout(timeout);
            resolve(true);
          }
        });

        this.process?.postMessage({ type: "heartbeat-request" });
      });
    });
  }

  private setupHeartbeatHandlers(): void {
    this.heartbeatMonitor.on("status", (event) => {
      this.ipcManager.send(HEALTH_STATUS_CHANNEL, event);

      if (event.status === "failed") {
        this.handleWorkerFailure();
      }
    });

    this.heartbeatMonitor.on("restartRequired", () => {
      console.warn("Reiniciando worker devido a falhas consecutivas");
      this.stopProcess()
        .then(() => this.startProcess())
        .catch((err) => console.error("Falha ao reiniciar worker:", err));
    });
  }

  private handleWorkerFailure(): void {
    console.error("Worker não respondeu após múltiplas tentativas");
  }

  private setupIPCCommunication(): void {
    if (!this.process) return;

    // Encaminha mensagens do worker para o IPCManager
    this.process.on("message", (message: unknown) => {
      if (this.isValidMessage(message)) {
        this.ipcManager.send(message.channel as any, message.payload);
      }
    });

    // Encaminha mensagens do IPCManager para o worker usando canal existente
    this.ipcManager.registerHandler("worker:heartbeat", (payload: unknown) => {
      this.process?.postMessage({
        channel: "worker:heartbeat",
        payload,
      });
    });
  }
}
