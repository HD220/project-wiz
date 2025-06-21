import { ITask, TaskResult } from '../ports/task.interface';
import { ActivityContext, ActivityHistoryEntry } from '@/core/domain/entities/job/value-objects';
import { SimpleEchoTool, SimpleEchoToolInput } from '@/infrastructure/tools/simple-echo.tool'; // Import the tool
import { SystemClock } from '@/core/common/services/system-clock.interface';

const defaultSystemClock: SystemClock = { now: () => new Date() };

// This task's specific input parameters, which might be defined by an LLM decision
export interface EchoToolTaskParams {
    echoMessage: string;
    repeat?: number;
}

export class EchoToolTask implements ITask {
    public readonly name = "EchoToolTask";
    private readonly simpleEchoTool: SimpleEchoTool;

    constructor(
        // This task could receive its tools via DI if the factory was more advanced.
        // For now, instantiating it directly.
        private readonly systemClock: SystemClock = defaultSystemClock
    ) {
        this.simpleEchoTool = new SimpleEchoTool();
    }

    async execute(
        context: ActivityContext,
        taskParameters?: Record<string, any>, // Parameters from LLM decision
        agentId?: string
    ): Promise<TaskResult> {
        console.log(`EchoToolTask: Executing for agent ${agentId || 'Unknown'}.`);

        const params = taskParameters as EchoToolTaskParams; // Assume parameters match
        const messageToEcho = params?.echoMessage || "Default message for EchoToolTask";
        const repeatCount = params?.repeat || 1;

        const toolInput: SimpleEchoToolInput = {
            message: messageToEcho,
            repeatCount: repeatCount,
        };

        try {
            const toolOutput = await this.simpleEchoTool.execute(toolInput, agentId);

            const historyMessage = `Used ${this.simpleEchoTool.name}: input='${messageToEcho}', repetitions=${repeatCount}. Output: ${JSON.stringify(toolOutput.result)}`;
            const newHistoryEntry = ActivityHistoryEntry.create({
                timestamp: this.systemClock.now(),
                actor: 'tool',
                toolName: this.simpleEchoTool.name,
                message: historyMessage,
                toolArgs: toolInput,
                toolResult: toolOutput.result,
            });
            const updatedHistory = context.getHistory().addEntry(newHistoryEntry);
            const updatedContext = context.updateHistory(updatedHistory);

            if (toolOutput.success) {
                return {
                    success: true,
                    output: toolOutput.result,
                    nextActivityContext: updatedContext,
                };
            } else {
                return {
                    success: false,
                    error: toolOutput.error || "SimpleEchoTool execution failed.",
                    nextActivityContext: updatedContext,
                };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`EchoToolTask: Error using SimpleEchoTool: ${errorMessage}`);

            const errorHistoryEntry = ActivityHistoryEntry.create({
                timestamp: this.systemClock.now(),
                actor: 'system',
                message: `Error in EchoToolTask while using ${this.simpleEchoTool.name}: ${errorMessage}`,
            });
            const updatedHistory = context.getHistory().addEntry(errorHistoryEntry);
            const updatedContext = context.updateHistory(updatedHistory);

            return {
                success: false,
                error: `Failed to execute ${this.simpleEchoTool.name}: ${errorMessage}`,
                nextActivityContext: updatedContext,
            };
        }
    }
}
