import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDatabase } from "@/infrastructure/database";
import { getLogger } from "@/infrastructure/logger";
import { llmProviders } from "@/main/persistence/schemas";

import {
  createLlmProviderFromData,
  LlmProviderWithData,
} from "./llm-factory.functions";

import type {
  CreateLlmProviderDto,
  UpdateLlmProviderDto,
} from "@/shared/types";

const logger = getLogger("llm-provider.crud");

// Validation Schemas
const CreateLlmProviderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  provider: z.string().min(1, "Provider is required"),
  model: z.string().min(1, "Model is required"),
  apiKey: z.string().min(1, "API Key is required"),
  isDefault: z.boolean().optional(),
});

const UpdateLlmProviderSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  provider: z.string().min(1, "Provider is required").optional(),
  model: z.string().min(1, "Model is required").optional(),
  apiKey: z.string().min(1, "API Key is required").optional(),
  isDefault: z.boolean().optional(),
});

// Create Operations
export async function createLlmProvider(
  data: CreateLlmProviderDto,
): Promise<LlmProviderWithData> {
  const validatedData = CreateLlmProviderSchema.parse(data);

  const existingProvider = await findLlmProviderByName(validatedData.name);
  if (existingProvider) {
    throw new Error(
      `LLM provider with name '${validatedData.name}' already exists`,
    );
  }

  if (validatedData.isDefault) {
    await clearDefaultProvider();
  }

  const providerData = buildProviderData(validatedData);
  return saveNewProvider(providerData);
}

// Read Operations
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

export async function findAllLlmProviders(): Promise<LlmProviderWithData[]> {
  const db = getDatabase();
  const providers = await db.select().from(llmProviders);
  return providers.map(createLlmProviderFromData);
}

export async function findDefaultLlmProvider(): Promise<LlmProviderWithData | null> {
  const db = getDatabase();
  const [provider] = await db
    .select()
    .from(llmProviders)
    .where(eq(llmProviders.isDefault, true));

  return provider ? createLlmProviderFromData(provider) : null;
}

// Update Operations
export async function updateLlmProvider(
  id: string,
  data: UpdateLlmProviderDto,
): Promise<LlmProviderWithData> {
  const validatedData = UpdateLlmProviderSchema.parse(data);

  const existingProvider = await findLlmProviderById(id);
  if (!existingProvider) {
    throw new Error(`LLM provider with id '${id}' not found`);
  }

  if (validatedData.name && validatedData.name !== existingProvider.getName()) {
    const nameConflict = await findLlmProviderByName(validatedData.name);
    if (nameConflict) {
      throw new Error(
        `LLM provider with name '${validatedData.name}' already exists`,
      );
    }
  }

  if (validatedData.isDefault) {
    await clearDefaultProvider();
  }

  const updateData = {
    ...validatedData,
    updatedAt: new Date(),
  };

  const db = getDatabase();
  const [updated] = await db
    .update(llmProviders)
    .set(updateData)
    .where(eq(llmProviders.id, id))
    .returning();

  logger.info("LLM provider updated", {
    providerId: updated.id,
    name: updated.name,
  });

  return createLlmProviderFromData(updated);
}

export async function setDefaultLlmProvider(
  id: string,
): Promise<LlmProviderWithData> {
  const existingProvider = await findLlmProviderById(id);
  if (!existingProvider) {
    throw new Error(`LLM provider with id '${id}' not found`);
  }

  await clearDefaultProvider();
  return updateLlmProvider(id, { isDefault: true });
}

// Delete Operations
export async function deleteLlmProvider(id: string): Promise<void> {
  const existingProvider = await findLlmProviderById(id);
  if (!existingProvider) {
    throw new Error(`LLM provider with id '${id}' not found`);
  }

  if (existingProvider.isDefault()) {
    throw new Error(
      "Cannot delete default LLM provider. Set another provider as default first.",
    );
  }

  const db = getDatabase();
  await db.delete(llmProviders).where(eq(llmProviders.id, id));

  logger.info("LLM provider deleted", {
    providerId: id,
    name: existingProvider.getName(),
  });
}

// Helper Functions
function buildProviderData(data: CreateLlmProviderDto): LlmProviderCreateData {
  return {
    name: data.name,
    provider: data.provider,
    model: data.model,
    apiKey: data.apiKey,
    isDefault: data.isDefault ?? false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

interface LlmProviderCreateData {
  name: string;
  provider: string;
  model: string;
  apiKey: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

async function saveNewProvider(
  providerData: LlmProviderCreateData,
): Promise<LlmProviderWithData> {
  const db = getDatabase();
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

async function clearDefaultProvider(): Promise<void> {
  const db = getDatabase();
  await db
    .update(llmProviders)
    .set({ isDefault: false })
    .where(eq(llmProviders.isDefault, true));
}
