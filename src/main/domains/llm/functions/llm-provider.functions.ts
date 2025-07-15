import { eq } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import { llmProviders } from "../../../persistence/schemas";
import { LLMProvider } from "../entities";
import {
  ProviderType,
  ModelConfig,
  Temperature,
  MaxTokens,
} from "../value-objects";

import type {
  CreateLlmProviderDto,
  UpdateLlmProviderDto,
  LlmProviderFilterDto,
} from "../../../../shared/types";

const logger = getLogger("llm-provider.functions");

export type LlmProviderWithData = LLMProvider & {
  id: string;
  name: string;
  provider: string;
  model: string;
  apiKey: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function createLlmProvider(
  data: CreateLlmProviderDto,
): Promise<LlmProviderWithData> {
  const db = getDatabase();

  // Check if provider already exists with this name
  const existingProvider = await findLlmProviderByName(data.name);
  if (existingProvider) {
    throw new Error(`LLM provider with name '${data.name}' already exists`);
  }

  const providerData = {
    name: data.name,
    provider: data.provider,
    model: data.model,
    apiKey: data.apiKey,
    isDefault: data.isDefault ?? false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const [saved] = await db
    .insert(llmProviders)
    .values(providerData)
    .returning();

  logger.info("LLM provider created", {
    providerId: saved.id,
    name: saved.name,
  });

  return createLlmProviderFromData(saved);
}

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

  let results;

  if (filter?.name) {
    results = await db
      .select()
      .from(llmProviders)
      .where(eq(llmProviders.name, filter.name));
  } else if (filter?.provider) {
    results = await db
      .select()
      .from(llmProviders)
      .where(eq(llmProviders.provider, filter.provider));
  } else if (filter?.isDefault !== undefined) {
    results = await db
      .select()
      .from(llmProviders)
      .where(eq(llmProviders.isDefault, filter.isDefault));
  } else {
    results = await db.select().from(llmProviders);
  }

  return results.map(createLlmProviderFromData);
}

export async function updateLlmProvider(
  id: string,
  data: UpdateLlmProviderDto,
): Promise<LlmProviderWithData> {
  const db = getDatabase();

  const existing = await findLlmProviderById(id);
  if (!existing) {
    throw new Error(`LLM provider with id '${id}' not found`);
  }

  // If name is being updated, check for conflicts
  if (data.name && data.name !== existing.name) {
    const existingByName = await findLlmProviderByName(data.name);
    if (existingByName) {
      throw new Error(`LLM provider with name '${data.name}' already exists`);
    }
  }

  const updateData = {
    ...data,
    updatedAt: new Date(),
  };

  const [updated] = await db
    .update(llmProviders)
    .set(updateData)
    .where(eq(llmProviders.id, id))
    .returning();

  logger.info("LLM provider updated", { providerId: id });

  return createLlmProviderFromData(updated);
}

export async function deleteLlmProvider(id: string): Promise<void> {
  const db = getDatabase();

  const existing = await findLlmProviderById(id);
  if (!existing) {
    throw new Error(`LLM provider with id '${id}' not found`);
  }

  await db.delete(llmProviders).where(eq(llmProviders.id, id));

  logger.info("LLM provider deleted", { providerId: id });
}

export async function setDefaultLlmProvider(
  id: string,
): Promise<LlmProviderWithData> {
  const db = getDatabase();

  const existing = await findLlmProviderById(id);
  if (!existing) {
    throw new Error(`LLM provider with id '${id}' not found`);
  }

  await db.transaction(async (tx) => {
    // Remove default flag from all providers
    await tx.update(llmProviders).set({ isDefault: false });
    // Set this provider as default
    await tx
      .update(llmProviders)
      .set({ isDefault: true })
      .where(eq(llmProviders.id, id));
  });

  logger.info("Default LLM provider set", { providerId: id });

  return findLlmProviderById(id) as Promise<LlmProviderWithData>;
}

export async function findDefaultLlmProvider(): Promise<LlmProviderWithData | null> {
  const db = getDatabase();

  const [provider] = await db
    .select()
    .from(llmProviders)
    .where(eq(llmProviders.isDefault, true));

  return provider ? createLlmProviderFromData(provider) : null;
}

function createLlmProviderFromData(
  data: Record<string, unknown>,
): LlmProviderWithData {
  // For now, use a simple approach without complex value objects
  const providerType = new ProviderType(
    data.provider as "openai" | "deepseek" | "anthropic" | "ollama",
  );
  const modelConfig = new ModelConfig(
    new Temperature(0.7),
    new MaxTokens(1000),
  );

  const provider = new LLMProvider(providerType, modelConfig);

  // Extend the provider with database fields
  return Object.assign(provider, {
    id: data.id as string,
    name: data.name as string,
    provider: data.provider as string,
    model: data.model as string,
    apiKey: data.apiKey as string,
    isDefault: data.isDefault as boolean,
    createdAt: data.createdAt as Date,
    updatedAt: data.updatedAt as Date,
  });
}
