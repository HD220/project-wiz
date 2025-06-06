import { tool } from "ai";
import { z } from "zod";

export const finalAnswerParameters = z.object({
  answer: z.string({
    description:
      "Your final answer must be the great and the most complete as possible, it must be outcome described.",
  }),
});

export const finalAnswerTool = tool({
  description: "A tool for providing the final answer.",
  parameters: finalAnswerParameters,
});
