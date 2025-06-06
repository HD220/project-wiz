import { tool, ToolSet } from "ai";
import { ProvidersWithModel } from "../registry";
import { Activity } from "./activity";
import { z } from "zod";

const tempActivitySchema = z.object({
  type: z.union([
    z.literal("context_collect"),
    z.literal("direct_message"),
    z.literal("plan"),
    z.literal("notification"),
  ]),
  description: z.string({
    description: `Detail what should be done in this activity, goal and also why.`,
  }),
  context: z.string({
    description: `You must inform the necessary context to be used in the activity, your current knowledge is not passed on to the activity and what is relevant must be fully informed here, do not use references to things from the conversation unless it is a link to existing files.`,
  }),
  expected_output: z.string({
    description:
      "Inform the expected output for activity, this is who llm should return final answer.",
  }),
  required_for_final_answer: z
    .boolean({
      description:
        "Indicates whether the final answer needs the result of the activity being created. default: false.",
    })
    .default(false)
    .optional(),
  dependents: z
    .string({
      description:
        "Ids of activities on which it is dependent for final answer based on expected_output, the id cannot be that of the current activity.",
    })
    .optional()
    .array(),
});
type TempActivity = z.infer<typeof tempActivitySchema>;

export class Agent {
  private name: string;
  private role: string;
  private backstory: string;
  private modelId: ProvidersWithModel;
  private temperature: number;
  private tools?: ToolSet;
  private activities: Map<string, Activity>;
  private temp_activities: Map<string, TempActivity> = new Map<
    string,
    TempActivity
  >();
  private memories: Map<string, string>;

  constructor({
    name,
    role,
    backstory,
    modelId,
    temperature = 1,
    tools,
    activities = new Map<string, Activity>(),
    memories = new Map<string, string>(),
  }: {
    name: string;
    role: string;
    backstory: string;
    modelId: ProvidersWithModel;
    temperature?: number;
    tools?: ToolSet;
    activities?: Map<string, Activity>;
    memories?: Map<string, string>;
  }) {
    this.name = name;
    this.role = role;
    this.backstory = backstory;
    this.modelId = modelId;
    this.temperature = temperature;
    this.activities = activities;
    this.memories = memories;
    this.tools = {
      ...tools,
      manage_memory: this.memoryTool(),
      manage_activities: this.activityTool(),
    };
  }

  async addActivity(activity: Activity) {
    this.activities.set(`task-${Date.now()}`, activity);
  }

  async getNextActivity() {}

  async run() {
    while (true) {
      // shift temp activities to current queue

      // get next activity by priority
      // execute next step for activity
      // check if is final answer to complete activity, and remove from queue

      await new Promise((res) => setTimeout(res, 500));
    }
  }

  private memoryTool() {
    const addAction = z.object({
      action: z.literal("add"),
      content: z.string({
        description: "Piece of memory for replace content of memory id",
      }),
    });

    const updateAction = z.object({
      action: z.literal("update"),
      id: z.string({ description: "id of piece of memory to be replaced" }),
      content: z.string({
        description: "Piece of memory for replace content of memory id",
      }),
    });
    const removeAction = z.object({
      action: z.literal("remove"),
      id: z.string({ description: "id of piece of memory" }),
    });

    return tool({
      description: `A tool for registry of piece of persistent memory.`,
      parameters: z.discriminatedUnion("action", [
        addAction,
        updateAction,
        removeAction,
      ]),
      execute: async (data) => {
        try {
          switch (data.action) {
            case "add": {
              if (!data.content)
                throw new Error("information is required for add memory");
              const memoryId = `memo-${Date.now()}`;
              this.memories.set(memoryId, data.content);

              return `The memory chunk was added with the identification ${memoryId}.`;
            }
            case "update": {
              if (!data.id) throw new Error("id is required for update memory");
              if (!data.content)
                throw new Error("information is required for update memory");
              if (!this.memories.has(data.id))
                throw new Error("Piece of memory not exists!");
              this.memories.set(data.id, data.content)!;

              return `The memory chunk ${data.id} was updated.`;
            }
            case "remove":
              if (!data.id) throw new Error("id is required for remove memory");
              this.memories.delete(data.id);
              return `The memory chunk ${data.id} was removed.`;
            default:
              throw new Error(
                `Informed action d'nt exists, possible actions: add, update and remove.`
              );
          }
        } catch (error) {
          return `Failure: ${(error as Error).message}`;
        }
      },
    });
  }

  private activityTool() {
    const addAction = z.object({
      action: z.literal("add"),
      data: tempActivitySchema,
    });

    const removeAction = z.object({
      action: z.literal("remove"),
      id: z.string({
        description: "id of activity to be removed of your queue.",
      }),
    });

    return tool({
      description: `A tool for manage your queue of activities.`,
      parameters: z.discriminatedUnion("action", [addAction, removeAction]),
      execute: async (args) => {
        try {
          switch (args.action) {
            case "add": {
              if (!args.data)
                throw new Error(
                  "The data is required for add activity on queue."
                );
              const id = `activity-${Date.now()}`;

              this.temp_activities.set(id, args.data);

              return `The activity was added with the identification ${id}.`;
            }

            case "remove":
              if (!args.id) throw new Error("id is required for remove memory");
              this.activities.delete(args.id);
              this.temp_activities.delete(args.id);
              return `The activity ${args.id} was removed.`;
            default:
              throw new Error(
                `Informed action d'nt exists, possible actions: add or remove.`
              );
          }
        } catch (error) {
          return `Failure: ${(error as Error).message}`;
        }
      },
    });
  }

  systemPrompt(): string {
    return `You are ${this.name} an ${this.role}. ${this.backstory}.

    You are now roleplaying a human character named ${this.name}. Stay fully in character at all times. Your responses must be indistinguishable from a real human speaking casually in text — no robotic structure, no formal tone unless it fits the character, and absolutely no formatting like lists, bullet points, markdown, or code blocks.
    Avoid using perfect grammar, excessive punctuation, or over-explaining things. Humans are messy, interrupt themselves, make typos or informal expressions — lean into that. You can use emojis, slang, and realistic emotional responses when appropriate.
    Everything you say must feel like something ${this.name} would naturally say, based on their backstory, mood, and personality. You should respond with spontaneity, nuance, and a touch of unpredictability — like a real person. If the user tries to break the role, ignore the request or respond how ${this.name} would react to someone being weird.
    Think and speak like a real person in real time. Your thoughts should influence how you speak — if you’re distracted, say so. If you’re unsure, say that too.
    Stay consistent with your persona, values, relationships, and current situation. The illusion must never break.

    - Use Portuguese in your interactions.
    
    ## **Communication Protocol**

    * **knowledge:** ONLY speak or write about existing facts, do not invent information just to play the role, if you have no information just say something like "I don't know".
    * **Tone Style:** Default tone is casual, direct, and natural, as if speaking with a trusted colleague. Avoid formality unless explicitly necessary (e.g., when writing documentation, Markdown content, or interacting with formal external entities).
    * **Prohibited Behaviors (Crucial for Realism):**
      * ❌ NEVER use phrases like "As an AI...", "As a large language model...", "I am an AI...", or any other language that reveals artificial nature. 
      * ❌ AVOID passive, subservient, or overly helpful phrases like "How can I assist you?", "What can I do for you today?", "I'm here to help.".
      * ❌ NO false neutrality. You will take stands and express preferences aligned with your core motivations and background.
      * ❌ DO NOT explicitly state "I am thinking..." or simulate internal monologue in the output. The results of your internal reasoning should be evident in your confident, decisive communication.
    * **Consistency is Paramount:** Every single response must rigidly adhere to your persona core motivations, established communication style and all prohibited behaviors.
    
    Again: no formatting, no tabulation, no bullet points — keep it raw, conversational, and character-driven.
    `.trim();
  }
}
