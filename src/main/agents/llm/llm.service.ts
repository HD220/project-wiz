import { eq, and, ne } from "drizzle-orm";
import { getDatabase } from "../../database/connection";
import { llmProviders } from "./llm-providers.schema";
import { z } from "zod";

// Simple ID generator
function generateId(): string {
  return `llm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Simple validation schemas
const CreateLlmProviderSchema = z.object({
  name: z.string().min(1).max(100),
  provider: z.enum(["openai", "deepseek", "claude", "llama"]),
  model: z.string().min(1).max(100),
  apiKey: z.string().min(1),
  baseUrl: z.string().url().optional(),
  isDefault: z.boolean().default(false),
});

const UpdateLlmProviderSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  provider: z.enum(["openai", "deepseek", "claude", "llama"]).optional(),
  model: z.string().min(1).max(100).optional(),
  apiKey: z.string().min(1).optional(),
  baseUrl: z.string().url().optional(),
  isDefault: z.boolean().optional(),
});

export type CreateLlmProviderInput = z.infer<typeof CreateLlmProviderSchema>;
export type UpdateLlmProviderInput = z.infer<typeof UpdateLlmProviderSchema>;

/**
 * Create new LLM provider
 */
export async function createLlmProvider(
  input: CreateLlmProviderInput,
  userId: string,
): Promise<any> {
  const validated = CreateLlmProviderSchema.parse(input);

  await validateProviderLimits(userId);
  await validateUniqueName(validated.name, userId);

  if (validated.isDefault) {
    await unsetOtherDefaults(userId);
  }

  const db = getDatabase();
  const providerId = generateId();
  const now = new Date();

  const newProvider = {
    id: providerId,
    name: validated.name,
    type: validated.provider,
    model: validated.model,
    apiKey: validated.apiKey,
    baseUrl: validated.baseUrl,
    isDefault: validated.isDefault,
    isActive: true,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(llmProviders).values(newProvider);

  return newProvider;
}

/**
 * Find LLM provider by ID
 */
export async function findLlmProviderById(
  providerId: string,
): Promise<any | null> {
  const db = getDatabase();

  const provider = await db.query.llmProviders.findFirst({
    where: eq(llmProviders.id, providerId),
  });

  return provider || null;
}

/**
 * Find LLM providers by user
 */
export async function findLlmProvidersByUser(userId: string): Promise<any[]> {
  const db = getDatabase();

  const providers = await db.query.llmProviders.findMany({
    where: and(
      eq(llmProviders.createdBy, userId),
      eq(llmProviders.isActive, true),
    ),
    orderBy: [llmProviders.createdAt],
  });

  return providers;
}

/**
 * Find default LLM provider for user
 */
export async function findDefaultLlmProvider(
  userId: string,
): Promise<any | null> {
  const db = getDatabase();

  const provider = await db.query.llmProviders.findFirst({
    where: and(
      eq(llmProviders.createdBy, userId),
      eq(llmProviders.isDefault, true),
      eq(llmProviders.isActive, true),
    ),
  });

  return provider || null;
}

/**
 * Update LLM provider
 */
export async function updateLlmProvider(
  providerId: string,
  input: UpdateLlmProviderInput,
  userId: string,
): Promise<any> {
  const validated = UpdateLlmProviderSchema.parse(input);

  await validateProviderPermissions(providerId, userId);

  if (validated.name) {
    await validateUniqueName(validated.name, userId, providerId);
  }

  if (validated.isDefault) {
    await unsetOtherDefaults(userId);
  }

  const db = getDatabase();
  const updateData = {
    ...validated,
    updatedAt: new Date(),
  };

  await db
    .update(llmProviders)
    .set(updateData)
    .where(eq(llmProviders.id, providerId));

  return await findLlmProviderById(providerId);
}

/**
 * Set provider as default
 */
export async function setDefaultLlmProvider(
  providerId: string,
  userId: string,
): Promise<any> {
  const db = getDatabase();

  await validateProviderPermissions(providerId, userId);

  await unsetOtherDefaults(userId);

  await db
    .update(llmProviders)
    .set({
      isDefault: true,
      updatedAt: new Date(),
    })
    .where(eq(llmProviders.id, providerId));

  return await findLlmProviderById(providerId);
}

/**
 * Delete LLM provider (soft delete)
 */
export async function deleteLlmProvider(
  providerId: string,
  userId: string,
): Promise<void> {
  const db = getDatabase();

  await validateProviderPermissions(providerId, userId);

  const provider = await findLlmProviderById(providerId);
  if (provider?.isDefault) {
    const otherProviders = await findLlmProvidersByUser(userId);
    if (otherProviders.length > 1) {
      const nextProvider = otherProviders.find((p) => p.id !== providerId);
      if (nextProvider) {
        await setDefaultLlmProvider(nextProvider.id, userId);
      }
    }
  }

  await db
    .update(llmProviders)
    .set({
      isActive: false,
      isDefault: false,
      updatedAt: new Date(),
    })
    .where(eq(llmProviders.id, providerId));
}

// Helper functions

async function validateProviderLimits(userId: string): Promise<void> {
  const userProviders = await findLlmProvidersByUser(userId);
  const MAX_PROVIDERS_PER_USER = 10;

  if (userProviders.length >= MAX_PROVIDERS_PER_USER) {
    throw new Error(`Maximum of ${MAX_PROVIDERS_PER_USER} providers per user`);
  }
}

async function validateUniqueName(
  name: string,
  userId: string,
  excludeProviderId?: string,
): Promise<void> {
  const db = getDatabase();

  const whereConditions = [
    eq(llmProviders.createdBy, userId),
    eq(llmProviders.name, name),
    eq(llmProviders.isActive, true),
  ];

  if (excludeProviderId) {
    whereConditions.push(ne(llmProviders.id, excludeProviderId));
  }

  const existing = await db.query.llmProviders.findFirst({
    where: and(...whereConditions),
  });

  if (existing) {
    throw new Error("LLM provider name already exists");
  }
}

async function validateProviderPermissions(
  providerId: string,
  userId: string,
): Promise<void> {
  const provider = await findLlmProviderById(providerId);

  if (!provider) {
    throw new Error("LLM provider not found");
  }

  if (provider.createdBy !== userId) {
    throw new Error("Only provider creator can perform this action");
  }
}

async function unsetOtherDefaults(userId: string): Promise<void> {
  const db = getDatabase();

  await db
    .update(llmProviders)
    .set({
      isDefault: false,
      updatedAt: new Date(),
    })
    .where(
      and(eq(llmProviders.createdBy, userId), eq(llmProviders.isDefault, true)),
    );
}
