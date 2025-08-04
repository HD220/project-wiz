import { z } from "zod";
import { getLlmProviderById } from "./queries";
import { LlmProviderSchema } from "@/shared/types";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("llm-provider.get-by-id.invoke");

// Input schema
const GetLlmProviderByIdInputSchema = z.string().min(1);

// Output schema
const GetLlmProviderByIdOutputSchema = LlmProviderSchema.nullable();

type GetLlmProviderByIdInput = z.infer<typeof GetLlmProviderByIdInputSchema>;
type GetLlmProviderByIdOutput = z.infer<typeof GetLlmProviderByIdOutputSchema>;

export default async function(id: GetLlmProviderByIdInput): Promise<GetLlmProviderByIdOutput> {
  logger.debug("Getting LLM provider by ID");

  // 1. Validate input
  const validatedId = GetLlmProviderByIdInputSchema.parse(id);

  // 2. Query recebe dados e gerencia campos técnicos internamente
  const dbProvider = await getLlmProviderById(validatedId);
  
  // 3. Mapeamento: SelectLlmProvider → LlmProvider (sem campos técnicos como apiKey)
  const apiProvider = dbProvider ? {
    id: dbProvider.id,
    userId: dbProvider.userId,
    name: dbProvider.name,
    type: dbProvider.type,
    baseUrl: dbProvider.baseUrl,
    defaultModel: dbProvider.defaultModel,
    isDefault: dbProvider.isDefault,
    createdAt: new Date(dbProvider.createdAt),
    updatedAt: new Date(dbProvider.updatedAt),
  } : null;
  
  // 4. Validate output
  const result = GetLlmProviderByIdOutputSchema.parse(apiProvider);
  
  logger.debug("LLM provider found", { found: result !== null });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      getById: (id: GetLlmProviderByIdInput) => Promise<GetLlmProviderByIdOutput>
    }
  }
}
EOF < /dev/null
