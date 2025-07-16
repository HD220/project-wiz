import { eq } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { llmProviders } from "../../../persistence/schemas";
import { createLlmProviderFromData, LlmProviderWithData } from "./llm-factory.functions";

import type { LlmProviderFilterDto } from "../../../../shared/types";

export async function findLlmProviderById(
  id: string,
): Promise<LlmProviderWithData | null> {
  const db = getDatabase();
  const [provider] = await db
    .select()
    .from(llmProviders)
    .where(eq(llmProviders.id, id));

  return provider ? createLlmProviderFromData(provider) : null;
}

export async function findLlmProviderByName(
  name: string,
): Promise<LlmProviderWithData | null> {
  const db = getDatabase();
  const [provider] = await db
    .select()
    .from(llmProviders)
    .where(eq(llmProviders.name, name));

  return provider ? createLlmProviderFromData(provider) : null;
}

export async function findAllLlmProviders(
  filter?: LlmProviderFilterDto,
): Promise<LlmProviderWithData[]> {
  const db = getDatabase();
  const results = await getFilteredProviders(db, filter);
  return results.map(createLlmProviderFromData);
}

async function getFilteredProviders(db: any, filter?: LlmProviderFilterDto) {
  if (filter?.name) {
    return await db
      .select()
      .from(llmProviders)
      .where(eq(llmProviders.name, filter.name));
  }
  if (filter?.provider) {
    return await db
      .select()
      .from(llmProviders)
      .where(eq(llmProviders.provider, filter.provider));
  }
  if (filter?.isDefault !== undefined) {
    return await db
      .select()
      .from(llmProviders)
      .where(eq(llmProviders.isDefault, filter.isDefault));
  }
  return await db.select().from(llmProviders);
}