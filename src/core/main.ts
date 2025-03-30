import {
  app,
  BrowserWindow,
  MessageChannelMain,
  MessagePortMain,
  utilityProcess,
} from "electron";
import path from "path";

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.ts"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../index.html"));
  }

  initLlamaWorker(mainWindow);
}

import {
  MessageChannelConfig,
  MessagePriority,
  MessagePayload,
  MessageType,
  IPCMessage,
  MessageBufferConfig,
  MessageBufferState,
  SerializationFormat,
} from "./llama/llama-types";

class MessageChannelManager {
  private ports: MessagePortMain[] = [];
  private messageBuffer: MessagePayload[] = [];
  private bufferTimeout: NodeJS.Timeout | null = null;
  private bufferConfig: MessageBufferConfig;
  private bufferState: MessageBufferState = {
    currentSize: 0,
    queuedMessages: 0,
    droppedMessages: 0,
    lastFlush: 0,
    averageProcessingTime: 0,
    memoryUsage: {
      heapUsed: 0,
      external: 0,
    },
    channels: {},
  };

  constructor(
    private mainWindow: BrowserWindow,
    private worker: any,
    config: MessageChannelConfig
  ) {
    this.bufferConfig = config.bufferConfig;
    this.setupMessageChannel();
    this.setupMetrics();
  }

  private setupMessageChannel() {
    const { port1, port2 } = new MessageChannelMain();

    // Configure renderer port handling
    this.mainWindow.webContents.ipc.on("request-llama-port", (event) => {
      const portMessage: IPCMessage = {
        id: crypto.randomUUID(),
        type: MessageType.EVENT,
        origin: "main",
        destination: "renderer",
        channel: "llama-port",
        timestamp: Date.now(),
        data: null,
        correlationId: undefined,
      };
      this.mainWindow.webContents.postMessage("llama-port", null, [port2]);
      port2.start();
      this.ports.push(port2);
    });

    // Configure worker port
    const workerMessage: IPCMessage = {
      type: MessageType.EVENT,
      origin: "main",
      destination: "worker",
      channel: "port",
      timestamp: Date.now(),
      data: null,
    };
    this.worker.postMessage(workerMessage, [port1]);
    port1.start();
    this.ports.push(port1);

    this.setupPortLifecycle(port1, port2);
  }

  private setupPortLifecycle(...ports: MessagePortMain[]) {
    ports.forEach((port) => {
      port.addListener("close", () => this.handlePortClose(port));
      port.addListener("message", (event) => {
        if (event.data && event.data.error) {
          this.handleMessageError(event.data.error, port);
        }
      });
    });

    this.worker.on("exit", (code: number) => {
      console.log(`Llama worker exited with code ${code}`);
      this.closeAllPorts();
    });

    process.on("before-quit", () => {
      this.worker.kill();
      this.closeAllPorts();
    });
  }

  private handlePortClose(port: MessagePortMain) {
    this.ports = this.ports.filter((p) => p !== port);
    if (this.ports.length === 0) {
      this.bufferMessages();
    }
    this.updateBufferState();
  }

  private handleMessageError(error: Error, port: MessagePortMain) {
    console.error(`MessageChannel error on port ${port}:`, error);
    port.close();
  }

  private closeAllPorts() {
    this.ports.forEach((port) => port.close());
    this.ports = [];
    this.flushBuffer();
  }

  private bufferMessages() {
    if (!this.bufferTimeout && this.messageBuffer.length > 0) {
      this.bufferTimeout = setTimeout(() => {
        this.flushBuffer();
      }, this.bufferConfig.retentionPeriod);
    }
  }

  private flushBuffer() {
    const startTime = Date.now();

    // Sort by priority (highest first)
    this.messageBuffer.sort(
      (a, b) =>
        (b.priority || MessagePriority.NORMAL) -
        (a.priority || MessagePriority.NORMAL)
    );

    // Process messages according to buffer config
    const messagesToProcess = this.bufferConfig.batchProcessing.enabled
      ? this.messageBuffer.slice(
          0,
          this.bufferConfig.batchProcessing.maxBatchSize
        )
      : this.messageBuffer;

    messagesToProcess.forEach((message) => {
      try {
        this.worker.postMessage(message);
        this.bufferState.queuedMessages--;
      } catch (error) {
        console.error("Failed to send buffered message:", error);
        this.bufferState.droppedMessages++;
      }
    });

    // Update buffer state
    this.messageBuffer = this.bufferConfig.batchProcessing.enabled
      ? this.messageBuffer.slice(this.bufferConfig.batchProcessing.maxBatchSize)
      : [];

    this.bufferState.lastFlush = Date.now();
    this.bufferState.averageProcessingTime =
      (this.bufferState.averageProcessingTime + (Date.now() - startTime)) / 2;
    this.bufferTimeout = null;

    if (this.messageBuffer.length > 0) {
      this.bufferMessages();
    }
  }

  private updateBufferState() {
    this.bufferState = {
      ...this.bufferState,
      currentSize: this.messageBuffer.length,
      queuedMessages: this.messageBuffer.length,
    };
  }

  public sendMessage<T = unknown>(message: MessagePayload<T>) {
    if (this.ports.length > 0) {
      try {
        this.worker.postMessage(message);
      } catch (error) {
        console.error("Failed to send message:", error);
        this.queueMessage(message);
      }
    } else {
      this.queueMessage(message);
    }
  }

  private queueMessage<T = unknown>(message: MessagePayload<T>) {
    if (this.messageBuffer.length >= this.bufferConfig.maxCapacity) {
      if (this.bufferConfig.overflowPolicy === "error") {
        throw new Error("Message buffer overflow");
      } else if (this.bufferConfig.overflowPolicy === "drop") {
        this.bufferState.droppedMessages++;
        return;
      }
      // For "block" policy, we'll just continue and add to buffer
    }

    this.messageBuffer.push(message);
    this.updateBufferState();
    this.bufferMessages();
  }

  public getBufferState(): MessageBufferState {
    return this.bufferState;
  }

  private setupMetrics() {
    setInterval(() => {
      console.log("MessageChannel metrics:", this.bufferState);
    }, 5000);
  }
}

function initLlamaWorker(mainWindow: BrowserWindow) {
  const workerPath = path.join(__dirname, "llama", "llama-worker.js");
  const llamaWorker = utilityProcess.fork(workerPath, [], {
    serviceName: "llama-worker",
    stdio: "pipe",
  });

  const channelConfig: MessageChannelConfig = {
    name: "llama-channel",
    bufferConfig: {
      maxCapacity: 1000,
      flushThreshold: 100,
      retentionPeriod: 5000,
      prioritizationStrategy: "priority",
      overflowPolicy: "drop",
      batchProcessing: {
        enabled: true,
        maxBatchSize: 50,
        timeout: 1000,
      },
    },
    serialization: SerializationFormat.JSON,
    validation: true,
    timeout: 30000,
    security: {
      encryption: false,
      signing: true,
      allowedOrigins: ["http://localhost:3000"],
    },
    qos: {
      maxRetries: 3,
      retryDelay: 1000,
      acknowledgementTimeout: 5000,
      priority: MessagePriority.NORMAL,
      deliveryGuarantee: "at-least-once",
    },
    securityPolicy: {
      allowedOrigins: ["http://localhost:3000"],
      maxMessageSize: 1024 * 1024, // 1MB
      encryptionRequired: false,
    },
    retryStrategy: "exponential",
  };

  new MessageChannelManager(mainWindow, llamaWorker, channelConfig);
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
