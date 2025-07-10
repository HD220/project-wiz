import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { z } from "zod";

export const RefinePersonaSuggestionSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  llmModel: z.string().optional(),
  llmTemperature: z.number().min(0).max(1).optional(),
  tools: z.array(z.string()).optional(),
});

export type RefinePersonaSuggestionCommandPayload = z.infer<
  typeof RefinePersonaSuggestionSchema
>;

export class RefinePersonaSuggestionCommand
  implements ICommand<RefinePersonaSuggestionCommandPayload>
{
  readonly type = "RefinePersonaSuggestionCommand";
  constructor(public readonly payload: RefinePersonaSuggestionCommandPayload) {
    RefinePersonaSuggestionSchema.parse(payload);
  }
}
