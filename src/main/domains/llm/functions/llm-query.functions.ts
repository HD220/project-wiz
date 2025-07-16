import { eq } from "drizzle-orm";
import { getDatabase } from "../../../infrastructure/database";
import { llmProviders } from "../../../persistence/schemas";
import { createLlmProviderFromData, LlmProviderWithData } from "./llm-factory.functions";

export async function findLlmProviderById(id: string): Promise<LlmProviderWithData | null> {
  const db = getDatabase();
  const [provider] = await db
    .select()
    .from(llmProviders)
    .where(eq(llmProviders.id, id));

  return provider ? createLlmProviderFromData(provider) : null;
}

export async function findLlmProviderByName(name: string): Promise<LlmProviderWithData | null> {
  const db = getDatabase();
  const [provider] = await db
    .select()
    .from(llmProviders)
    .where(eq(llmProviders.name, name));

  return provider ? createLlmProviderFromData(provider) : null;
}

export async function findAllLlmProviders(): Promise<LlmProviderWithData[]> {
  const db = getDatabase();
  const providers = await db.select().from(llmProviders);
  return providers.map(createLlmProviderFromData);
}
