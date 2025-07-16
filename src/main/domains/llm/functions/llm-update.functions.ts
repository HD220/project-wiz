import { eq } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import { llmProviders } from "../../../persistence/schemas";
import { createLlmProviderFromData, LlmProviderWithData } from "./llm-factory.functions";
import { findLlmProviderById, findLlmProviderByName } from "./llm-query.functions";

import type { UpdateLlmProviderDto } from "../../../../shared/types";

const logger = getLogger("llm-provider.update");

export async function updateLlmProvider(
  id: string,
  data: UpdateLlmProviderDto,
): Promise<LlmProviderWithData> {
  await validateProviderUpdate(id, data);

  const updateData = {
    ...data,
    updatedAt: new Date(),
  };

  const db = getDatabase();
  const [updated] = await db
    .update(llmProviders)
    .set(updateData)
    .where(eq(llmProviders.id, id))
    .returning();

  logger.info("LLM provider updated", { providerId: id });
  return createLlmProviderFromData(updated);
}

async function validateProviderUpdate(id: string, data: UpdateLlmProviderDto) {
  const existing = await findLlmProviderById(id);
  if (!existing) {
    throw new Error(`LLM provider with id '${id}' not found`);
  }

  if (data.name && data.name !== existing.name) {
    const existingByName = await findLlmProviderByName(data.name);
    if (existingByName) {
      throw new Error(`LLM provider with name '${data.name}' already exists`);
    }
  }
}

export async function deleteLlmProvider(id: string): Promise<void> {
  const existing = await findLlmProviderById(id);
  if (!existing) {
    throw new Error(`LLM provider with id '${id}' not found`);
  }

  const db = getDatabase();
  await db.delete(llmProviders).where(eq(llmProviders.id, id));
  logger.info("LLM provider deleted", { providerId: id });
}