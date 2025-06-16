import { tool } from "ai";
import { z } from "zod";

export const throughParameters = z.object({
  thinking: z.string({ description: "Your persona thought." }),
  // observation: z
  //   .string({ description: "Your observation of last recent actions." })
  //   .optional(),
});

export const thoughtTool = tool({
  description:
    "Your thinking about the action to be taken, should be based on your personality persona.",
  parameters: throughParameters,
  execute: async ({ thinking }) => `Thought: ${thinking}`,
});
