import {
  ILLMAdapter,
  LLMAgentDecision,
} from '@/core/application/ports/llm-adapter.interface';
import { ActivityContext } from '@/core/domain/entities/job/value-objects/activity-context.vo';
import { AgentInternalState } from '@/core/domain/entities/agent';

export class MockLLMAdapter implements ILLMAdapter {
  private callCount = 0;
  private cannedDecisions: LLMAgentDecision[] = [
    {
      thought: "MockLLMAdapter: This is the first canned thought. I should suggest a simple task like 'SimpleEchoTask'.",
      nextTask: "SimpleEchoTask",
      taskParameters: { message: "Hello from MockLLMAdapter via SimpleEchoTask!" },
      isFinalAnswer: false,
    },
    {
      thought: "MockLLMAdapter: The first task was notionally executed. Now I'll provide a final answer.",
      outputForUser: "MockLLMAdapter has completed its predefined sequence of decisions.",
      isFinalAnswer: true,
    },
    // Add more canned decisions for more complex testing scenarios if desired
  ];

  constructor(customDecisions?: LLMAgentDecision[]) {
    if (customDecisions && customDecisions.length > 0) {
      this.cannedDecisions = customDecisions;
    }
    console.log("MockLLMAdapter: Initialized.");
  }

  async generateAgentDecision(
    context: ActivityContext,
    agentState: AgentInternalState,
    availableTools?: any[] // availableTools is part of the interface, not used by this mock
  ): Promise<LLMAgentDecision> {
    console.log(`MockLLMAdapter: generateAgentDecision called (call #${this.callCount + 1}).`);
    // console.log("MockLLMAdapter: Current ActivityContext History Length:", context.getHistory().getLength());
    // console.log("MockLLMAdapter: Current Agent Goal:", agentState.currentGoal);
    // console.log("MockLLMAdapter: Available Tools (not used by mock):", availableTools);


    const decision = this.cannedDecisions[this.callCount % this.cannedDecisions.length];
    this.callCount++;

    console.log("MockLLMAdapter: Returning decision:", JSON.stringify(decision, null, 2));
    return Promise.resolve(decision); // Ensure it's a Promise
  }

  // Helper to reset call count for testing
  public resetCallCount(): void {
    this.callCount = 0;
    console.log("MockLLMAdapter: Call count reset.");
  }
}
