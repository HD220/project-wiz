import {
  CoreMessage,
  createDataStreamResponse,
  InvalidToolArgumentsError,
  NoSuchToolError,
  streamText,
  TextPart,
  ToolExecutionError,
  ToolSet,
} from "ai";
import { ProvidersWithModel, registry } from "../registry";

export class Activity {
  private history: CoreMessage[];
  private history_resume?: string;
  private temperature: number;
  private description: string;
  private expected_output: string;

  constructor({
    history,
    temperature = 1,
    history_resume,
    description,
    expected_output,
  }: {
    history?: CoreMessage[];
    temperature?: number;
    history_resume?: string;
    description: string;
    expected_output: string;
  }) {
    this.history = history || [];
    this.temperature = temperature;
    this.history_resume = history_resume;
    this.description = description;
    this.expected_output = expected_output;
  }

  addToHistory(message: CoreMessage) {
    this.history.push(message);
  }

  async executeStep({
    agentPrompt,
    modelId,
    tools,
    temperature,
  }: {
    agentPrompt: string;
    modelId: ProvidersWithModel;
    tools: ToolSet;
    temperature?: number;
  }) {
    try {
      const result = streamText({
        model: registry.languageModel(modelId),
        system: `${agentPrompt}\n\n${this.activityPrompt()}`,
        tools: tools,
        messages: this.history,
        temperature: this.temperature || temperature,
        toolChoice: "required",
        // maxSteps: 1,
        onError: async ({ error }) => {
          if (NoSuchToolError.isInstance(error)) {
            console.error("onError: The model tried to call a unknown tool.");
          } else if (InvalidToolArgumentsError.isInstance(error)) {
            console.error(
              "onError: The model called a tool with invalid arguments."
            );
          } else if (ToolExecutionError.isInstance(error)) {
            console.error("onError: An error occurred during tool execution.");
          } else {
            console.error("onError: An unknown error occurred.", error);
          }
        },
        onFinish: async ({ text, usage, response, toolCalls }) => {
          // console.log(
          //   `Finish LLM call, data: ${usage}, ${text.substring(0, 100)}, ${JSON.stringify(toolCalls)}`
          // );
          this.history.push(
            ...response.messages.map((message) => {
              if (message.role === "tool") return message;
              if (typeof message.content === "string") return message;
              return {
                ...message,
                content: message.content.map((part) => {
                  if (
                    part.type === "tool-call" &&
                    part.toolName === "finalAnswer"
                  ) {
                    const convertedAnswerToText: TextPart = {
                      type: "text",
                      text: (part.args as any).answer,
                      providerOptions: part.providerOptions,
                    };
                    return convertedAnswerToText;
                  }
                  return part;
                }),
              };
            })
          );
        },
      });

      return result.fullStream;
    } catch (error) {
      if (NoSuchToolError.isInstance(error)) {
        console.error(`tryCatch: handle the no such tool error`);
      } else if (InvalidToolArgumentsError.isInstance(error)) {
        console.error(`tryCatch: handle the invalid tool arguments error`);
      } else if (ToolExecutionError.isInstance(error)) {
        console.error(`tryCatch: handle the tool execution error`);
      } else {
        console.error(`tryCatch: handle other errors`, error);
      }
      return null;
    }
  }

  private activityPrompt() {
    return `
    ## Interaction Envoriment
    
    You MUST either use a tool OR give your best final answer not both at the same time. When responding, you must use the following instructions:

    * You can use more than one tool per answer.
    * Always use the thinking tool and at least one other tool.
    * You MUST ALWAYS use the thinking tool for any integration action; only one thinking call can be used per action.
    * When using the final_answer tool, do not use any other tools except the thinking tool.
    * AWAYS use the tools write_file and read_file for documenting.
    
    Current task:
    ${this.description}
    ${this.history_resume ? `\ntask history Resume: \n${this.history_resume}\n`.trim() : ""}
    Expected Output:
    ${this.expected_output}
    `.trim();
  }
}
