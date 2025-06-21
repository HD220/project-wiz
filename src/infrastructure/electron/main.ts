// src/infrastructure/electron/main.ts
import 'reflect-metadata'; // Essential for InversifyJS
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { container } from '@/infrastructure/ioc/inversify.config';
import { TYPES } from '@/infrastructure/ioc/types';
import { IAgentLifecycleService } from '@/domain/services/i-agent-lifecycle.service';
import { ILoggerService } from '@/domain/services/i-logger.service';
import { EnqueueJobUseCase, EnqueueJobInput } from '@/domain/use-cases/job/enqueue-job.use-case';
import { IAIAgentRepository } from '@/domain/repositories/i-ai-agent.repository';
import { AIAgent } from '@/domain/entities/ai-agent.entity';
import { ChatMessage } from '@/domain/services/i-llm.service'; // Added for chat payload type

let mainWindow: BrowserWindow | null = null;
const logger = container.get<ILoggerService>(TYPES.ILoggerService);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Assuming preload.ts compiles to preload.js in the same dir
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the React app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173'); // Vite dev server URL (adjust if different)
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built index.html
    mainWindow.loadFile(path.join(__dirname, '../ui/react/dist/index.html')); // Adjust path to your React build output
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', async () => {
  logger.info('[ElectronMain] App is ready. Initializing services...');
  try {
    // Initialize and start AI agents
    const agentLifecycleService = container.get<IAgentLifecycleService>(TYPES.IAgentLifecycleService);
    await agentLifecycleService.initializeAndStartAgents();
    logger.info('[ElectronMain] AgentLifecycleService initialized and agents started.');

    // Setup IPC Handlers
    setupIPCHandlers();

  } catch (error) {
    logger.error('[ElectronMain] Failed to initialize services:', error);
    // Consider quitting the app or showing an error dialog
  }

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  const agentLifecycleService = container.get<IAgentLifecycleService>(TYPES.IAgentLifecycleService);
  agentLifecycleService.stopAllAgents().then(() => {
    logger.info('[ElectronMain] All agents stopped.');
  });
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});


// IPC Handler Setup
function setupIPCHandlers() {
  logger.info('[ElectronMain] Setting up IPC Handlers...');

  // Example: Enqueue Job
  ipcMain.handle('enqueue-job', async (event, jobInput: EnqueueJobInput) => {
    try {
      logger.info(`[IPC] Received 'enqueue-job' request: ${JSON.stringify(jobInput)}`);
      const enqueueJobUseCase = container.get<EnqueueJobUseCase>(TYPES.EnqueueJobUseCase);
      const result = await enqueueJobUseCase.execute(jobInput);
      logger.info(`[IPC] 'enqueue-job' success: ${JSON.stringify(result)}`);
      return { success: true, data: result };
    } catch (error: any) {
      logger.error(`[IPC] Error handling 'enqueue-job': ${error.message}`, error);
      return { success: false, error: error.message };
    }
  });

  // Handler for sending a message to an agent and initiating a stream
  ipcMain.handle('chat:sendMessage', async (event, payload: { agentId: string; messages: ChatMessage[]; options?: Record<string, any> }) => {
    const { agentId, messages, options } = payload;
    logger.info(`[IPC] Received 'chat:sendMessage' for agent ${agentId}. Messages: ${messages.length}`);

    try {
      const agentRepo = container.get<IAIAgentRepository>(TYPES.IAIAgentRepository);
      const agentProfile = await agentRepo.findById(agentId);
      if (!agentProfile) {
        logger.error(`[IPC] Agent ${agentId} not found for chat:sendMessage.`);
        return { success: false, error: `Agent ${agentId} not found.` };
      }

      const enqueueJobUseCase = container.get<EnqueueJobUseCase>(TYPES.EnqueueJobUseCase);
      const jobInput: EnqueueJobInput = {
        queueName: agentProfile.id, // Use agentId as queueName (or agentProfile.props.queueName if distinct)
        jobName: options?.jobName || `ProcessChatMessageStream-${agentId}`,
        taskPayload: {
          chatMessages: messages,
          isStreamRequested: true,
          // Include a way to identify the sender for stream routing if multiple windows/senders
          // For simplicity, we assume stream events are broadcast or handled by a single main window context for now.
          // A robust solution might involve senderId: event.sender.id (if available and useful)
          ...(options || {})
        },
      };

      const enqueueResult = await enqueueJobUseCase.execute(jobInput);
      logger.info(`[IPC] Chat message enqueued as job ${enqueueResult.jobId} for agent ${agentId}.`);

      // Conceptual: The AIAgentExecutionService for this job, upon receiving the stream from SdkLlmService,
      // would need to send 'chat:streamEvent' events back to the renderer.
      // This could be done if AIAgentExecutionService has access to `mainWindow.webContents.send` or similar.
      // e.g., inside AIAgentExecutionService, after getting a stream part from SdkLlmService:
      // if (mainWindow && job.payload.isStreamRequested) { // Check if stream is for this UI
      //    mainWindow.webContents.send('chat:streamEvent', streamPart);
      // }
      // This is a simplification; a more robust system might use an event bus or dedicated IPC stream manager.

      return { success: true, data: { jobId: enqueueResult.jobId, message: "Chat message enqueued, stream will follow on 'chat:streamEvent'." } };

    } catch (error: any) {
      logger.error(`[IPC] Error in 'chat:sendMessage': ${error.message}`, error);
      return { success: false, error: error.message };
    }
  });

  // Example: List AI Agents
  ipcMain.handle('list-ai-agents', async () => {
    try {
      logger.info(`[IPC] Received 'list-ai-agents' request.`);
      const agentRepo = container.get<IAIAgentRepository>(TYPES.IAIAgentRepository);
      const agents = await agentRepo.findAll();
      // Convert to plain objects for IPC (entities might have methods)
      const plainAgents = agents.map(agent => ({ ...agent.props }));
      logger.info(`[IPC] 'list-ai-agents' success. Found ${plainAgents.length} agents.`);
      return { success: true, data: plainAgents };
    } catch (error: any) {
      logger.error(`[IPC] Error handling 'list-ai-agents': ${error.message}`, error);
      return { success: false, error: error.message };
    }
  });

  // Example: Create AI Agent
  ipcMain.handle('create-ai-agent', async (event, agentData: Omit<AIAgent['props'], 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      logger.info(`[IPC] Received 'create-ai-agent' request: ${JSON.stringify(agentData)}`);
      const agentRepo = container.get<IAIAgentRepository>(TYPES.IAIAgentRepository);
      const newAgent = AIAgent.create(agentData); // Use the entity's create method
      await agentRepo.save(newAgent);
      logger.info(`[IPC] 'create-ai-agent' success. Agent ID: ${newAgent.id}`);
      return { success: true, data: { ...newAgent.props } };
    } catch (error: any) {
      logger.error(`[IPC] Error handling 'create-ai-agent': ${error.message}`, error);
      return { success: false, error: error.message };
    }
  });

  logger.info('[ElectronMain] IPC Handlers setup complete.');
}

// Add basic security considerations for Electron apps if not already present
// (e.g., session permissions, webContents security settings)
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'http://localhost:5173' && process.env.NODE_ENV === 'development') { // Allow Vite dev server
      logger.warn(`[ElectronMain] Prevented navigation to ${navigationUrl} (Dev mode)`);
      event.preventDefault();
    } else if (process.env.NODE_ENV !== 'development' && !parsedUrl.protocol.startsWith('file:')) { // In prod, only allow file protocols
        logger.warn(`[ElectronMain] Prevented navigation to ${navigationUrl} (Prod mode)`);
        event.preventDefault();
    }
  });

  contents.setWindowOpenHandler(({ url }) => {
    logger.warn(`[ElectronMain] Prevented new window/tab to ${url}`);
    return { action: 'deny' };
  });
});
