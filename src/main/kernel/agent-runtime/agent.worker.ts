import { parentPort, workerData } from 'worker_threads';
import { generateText } from 'ai';
import logger from '@/main/logger';

interface WorkerData {
  agentId: string;
  agentConfig: {
    name: string;
    role: string;
    systemPrompt: string;
    llmModel: string;
    capabilities: string[];
  };
  task: {
    id: string;
    title: string;
    description?: string;
    type: string;
    priority: string;
  };
  projectPath: string;
  worktreePath: string;
}

interface AgentTools {
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  executeShell: (command: string, args: string[]) => Promise<{ stdout: string; stderr: string; exitCode: number }>;
  listDirectory: (path: string) => Promise<string[]>;
}

class AgentWorker {
  private workerData: WorkerData;
  private tools: AgentTools;
  private pendingToolCalls = new Map<string, { resolve: Function; reject: Function }>();

  constructor(data: WorkerData) {
    this.workerData = data;
    this.tools = this.initializeTools();
    this.setupMessageHandling();
  }

  private setupMessageHandling(): void {
    parentPort?.on('message', (message) => {
      if (message.type === 'tool_response') {
        const pending = this.pendingToolCalls.get(message.id);
        if (pending) {
          if (message.error) {
            pending.reject(new Error(message.error));
          } else {
            pending.resolve(message.result);
          }
          this.pendingToolCalls.delete(message.id);
        }
      }
    });
  }

  async executeTask(): Promise<void> {
    const { task, agentConfig } = this.workerData;

    try {
      this.sendMessage('status', { status: 'analyzing', taskId: task.id });

      // 1. Analisar a tarefa usando LLM
      const analysis = await this.analyzeTask(task, agentConfig);
      
      this.sendMessage('progress', { 
        taskId: task.id, 
        progress: 25, 
        message: 'Task analysis completed' 
      });

      // 2. Planejar subtarefas
      const plan = await this.planExecution(task, analysis, agentConfig);
      
      this.sendMessage('progress', { 
        taskId: task.id, 
        progress: 50, 
        message: 'Execution plan created' 
      });

      // 3. Executar o plano
      await this.executePlan(plan);

      this.sendMessage('status', { 
        status: 'completed', 
        taskId: task.id,
        result: 'Task completed successfully'
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.sendMessage('error', { 
        taskId: task.id, 
        error: errorMessage,
        stack: errorStack 
      });
    }
  }

  private async analyzeTask(task: WorkerData['task'], agentConfig: WorkerData['agentConfig']): Promise<string> {
    const prompt = `
You are ${agentConfig.name}, a ${agentConfig.role}.
${agentConfig.systemPrompt}

Analyze this task:
Title: ${task.title}
Description: ${task.description || 'No description provided'}
Type: ${task.type}
Priority: ${task.priority}

Provide a detailed analysis of what needs to be done.
Consider the file structure of the project and what changes might be needed.
`;

    try {
      // Por agora, retornar análise mock
      // Em implementação real, seria feita chamada para LLM aqui
      const analysis = `Analysis for task: ${task.title}
Type: ${task.type}
Priority: ${task.priority}
This task requires careful implementation following best practices.`;

      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to analyze task: ${errorMessage}`);
    }
  }

  private async planExecution(task: WorkerData['task'], analysis: string, agentConfig: WorkerData['agentConfig']): Promise<any> {
    const prompt = `
Based on this analysis:
${analysis}

Create a detailed execution plan for the task: ${task.title}
Break it down into specific steps that can be executed.
Consider the available tools: ${agentConfig.capabilities.join(', ')}
`;

    // Por agora, retornar plano mock
    const plan = {
      steps: [
        {
          id: '1',
          action: 'analyze_codebase',
          description: 'Analyze current codebase structure',
          tools: ['listDirectory', 'readFile']
        },
        {
          id: '2',
          action: 'implement_changes',
          description: 'Implement required changes',
          tools: ['writeFile']
        },
        {
          id: '3',
          action: 'verify_implementation',
          description: 'Verify the implementation works correctly',
          tools: ['executeShell']
        }
      ]
    };

    return plan;
  }

  private async executePlan(plan: any): Promise<void> {
    const { task } = this.workerData;
    const totalSteps = plan.steps.length;

    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      
      this.sendMessage('progress', {
        taskId: task.id,
        progress: 50 + (i + 1) / totalSteps * 40, // 50-90%
        message: `Executing: ${step.description}`
      });

      try {
        await this.executeStep(step);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to execute step ${step.id}: ${errorMessage}`);
      }
    }

    // Finalizar com 100%
    this.sendMessage('progress', {
      taskId: task.id,
      progress: 100,
      message: 'Task execution completed'
    });
  }

  private async executeStep(step: any): Promise<void> {
    switch (step.action) {
      case 'analyze_codebase':
        await this.analyzeCodebase();
        break;
      case 'implement_changes':
        await this.implementChanges();
        break;
      case 'verify_implementation':
        await this.verifyImplementation();
        break;
      default:
        throw new Error(`Unknown step action: ${step.action}`);
    }
  }

  private async analyzeCodebase(): Promise<void> {
    // Exemplo de análise do codebase
    try {
      const files = await this.tools.listDirectory(this.workerData.projectPath);
      this.sendMessage('log', {
        level: 'info',
        message: `Found ${files.length} files in project root`,
        metadata: { files: files.slice(0, 10) } // Apenas os primeiros 10
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to analyze codebase: ${errorMessage}`);
    }
  }

  private async implementChanges(): Promise<void> {
    // Exemplo de implementação de mudanças
    const { task } = this.workerData;
    
    this.sendMessage('log', {
      level: 'info',
      message: `Implementing changes for task: ${task.title}`,
      metadata: { taskType: task.type }
    });

    // Aqui seria a lógica real de implementação
    // Por exemplo, modificar arquivos específicos baseado no tipo da tarefa
  }

  private async verifyImplementation(): Promise<void> {
    // Exemplo de verificação da implementação
    this.sendMessage('log', {
      level: 'info',
      message: 'Verifying implementation...',
    });

    // Aqui seria executado teste ou verificação
    // Por exemplo: npm test, lint check, etc.
  }

  private initializeTools(): AgentTools {
    return {
      readFile: async (path: string) => {
        return this.callTool('readFile', { path });
      },
      writeFile: async (path: string, content: string) => {
        return this.callTool('writeFile', { path, content });
      },
      executeShell: async (command: string, args: string[]) => {
        return this.callTool('executeShell', { command, args });
      },
      listDirectory: async (path: string) => {
        return this.callTool('listDirectory', { path });
      }
    };
  }

  private async callTool(toolName: string, args: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(7);
      
      this.pendingToolCalls.set(id, { resolve, reject });
      
      parentPort?.postMessage({ 
        type: 'tool_call', 
        tool: toolName, 
        args, 
        id 
      });
      
      // Timeout após 30 segundos
      setTimeout(() => {
        if (this.pendingToolCalls.has(id)) {
          this.pendingToolCalls.delete(id);
          reject(new Error(`Tool call timeout: ${toolName}`));
        }
      }, 30000);
    });
  }

  private sendMessage(type: string, data: any): void {
    parentPort?.postMessage({ type, data, timestamp: Date.now() });
  }
}

// Ponto de entrada do worker
async function main() {
  if (!workerData) {
    throw new Error('Worker data not provided');
  }

  const worker = new AgentWorker(workerData as WorkerData);
  await worker.executeTask();
}

main().catch(error => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;
  parentPort?.postMessage({ 
    type: 'error', 
    data: { error: errorMessage, stack: errorStack } 
  });
  process.exit(1);
});