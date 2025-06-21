import { ITask, TaskResult } from '../ports/task.interface';
import { ActivityContext, ActivityHistoryEntry } from '@/core/domain/entities/job/value-objects';
import { SystemClock } from '@/core/common/services/system-clock.interface';

// Simple in-memory Clock for now if dedicated service isn't created yet for tasks
const defaultSystemClock: SystemClock = { now: () => new Date() };

export interface SimpleEchoTaskInput {
    message: string;
    // Potentially other parameters like repeatCount from SimpleEchoTool could be passed here
    // if the LLM decision includes them in taskParameters.
    repeatCount?: number; // Made optional as per SimpleEchoTool schema
}

export class SimpleEchoTask implements ITask {
    public readonly name = "SimpleEchoTask"; // For identification / registration

    constructor(
        // Tasks can have dependencies injected if needed, e.g., specific tools or services.
        // For SimpleEchoTask, no complex dependencies are needed.
        private readonly systemClock: SystemClock = defaultSystemClock
    ) {}

    async execute(context: ActivityContext, taskParameters?: Record<string, any>, agentId?: string): Promise<TaskResult> {
        console.log(`SimpleEchoTask: Executing for agent ${agentId || 'Unknown'}.`);
        // console.log(`SimpleEchoTask: Current ActivityContext History Length: ${context.getHistory().getLength()}`);

        const input = taskParameters as SimpleEchoTaskInput; // Assume parameters match SimpleEchoTaskInput
        const messageToEcho = input?.message || "Default echo: No message provided in taskParameters.";
        const repeatCount = input?.repeatCount || 1;

        let echoedMessage = "";
        for (let i = 0; i < repeatCount; i++) {
          echoedMessage += messageToEcho + (repeatCount > 1 ? ` (repetition ${i+1})` : "");
          if (repeatCount > 1 && i < repeatCount - 1) {
            echoedMessage += "\\n";
          }
        }

        const outputMessage = `SimpleEchoTask for agent ${agentId || 'Unknown'} says: "${echoedMessage}" at ${this.systemClock.now().toISOString()}`;

        const newHistoryEntry = ActivityHistoryEntry.create({
            timestamp: this.systemClock.now(),
            actor: 'tool', // Or 'agent' if the task is considered part of the agent's direct action
            toolName: this.name,
            message: `Echoed: "${messageToEcho}" (repeated ${repeatCount} times).`,
            toolResult: { echoed: outputMessage } // Changed from echoedMessage to outputMessage for clarity
        });
        const updatedHistory = context.getHistory().addEntry(newHistoryEntry);
        const updatedContext = context.updateHistory(updatedHistory);

        return {
            success: true,
            output: { message: outputMessage },
            nextActivityContext: updatedContext,
        };
    }
}
