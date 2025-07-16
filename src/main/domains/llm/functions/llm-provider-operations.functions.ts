import { eq } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import { llmProviders } from "../../../persistence/schemas";

import { createLlmProviderFromData, LlmProviderWithData } from "./llm-factory.functions";
import { findLlmProviderById } from "./llm-query.functions";

const logger = getLogger("llm-provider.operations");

export async function setDefaultLlmProvider(
  id: string,
): Promise<LlmProviderWithData> {
  const existing = await findLlmProviderById(id);
  if (!existing) {
    throw new Error(`LLM provider with id '${id}' not found`);
  }

  await updateDefaultProvider(id);
  logger.info("Default LLM provider set", { providerId: id });
  return findLlmProviderById(id) as Promise<LlmProviderWithData>;
}

async function updateDefaultProvider(id: string): Promise<void> {
  const db = getDatabase();

  await db.transaction(async (tx) => {
    await tx.update(llmProviders).set({ isDefault: false });
    await tx
      .update(llmProviders)
      .set({ isDefault: true })
      .where(eq(llmProviders.id, id));
  });
}

export async function findDefaultLlmProvider(): Promise<LlmProviderWithData | null> {
  const db = getDatabase();
  const [provider] = await db
    .select()
    .from(llmProviders)
    .where(eq(llmProviders.isDefault, true));

  return provider ? createLlmProviderFromData(provider) : null;
}
