import { z } from "zod";
import { findLlmProvider } from "@/main/ipc/llm-provider/queries";
import { LlmProviderSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("llm-provider.get-by-id.invoke");

// Input schema
const GetLlmProviderByIdInputSchema = z.object({
  providerId: z.string().min(1, "Provider ID is required"),
});

// Output schema
const GetLlmProviderByIdOutputSchema = LlmProviderSchema.nullable();

type GetLlmProviderByIdInput = z.infer<typeof GetLlmProviderByIdInputSchema>;
type GetLlmProviderByIdOutput = z.infer<typeof GetLlmProviderByIdOutputSchema>;

export default async function(input: GetLlmProviderByIdInput): Promise<GetLlmProviderByIdOutput> {
  logger.debug("Getting LLM provider by ID", { providerId: input.providerId });

  // 1. Validate input
  const validatedInput = GetLlmProviderByIdInputSchema.parse(input);

  // 2. Check authentication and get current user
  const currentUser = requireAuth();

  // 3. Find provider with ownership validation
  const dbProvider = await findLlmProvider(validatedInput.providerId, currentUser.id);
  
  // 4. Map database result to shared type
  const apiProvider = dbProvider ? {
    id: dbProvider.id,
    userId: dbProvider.ownerId, // Map ownerId to userId for API consistency
    name: dbProvider.name,
    type: dbProvider.type,
    baseUrl: dbProvider.baseUrl,
    defaultModel: dbProvider.defaultModel,
    isDefault: dbProvider.isDefault,
    createdAt: new Date(dbProvider.createdAt),
    updatedAt: new Date(dbProvider.updatedAt),
  } : null;
  
  // 5. Validate output
  const result = GetLlmProviderByIdOutputSchema.parse(apiProvider);
  
  logger.debug("LLM provider found", { found: result !== null });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      get: (input: GetLlmProviderByIdInput) => Promise<GetLlmProviderByIdOutput>
    }
  }
}
