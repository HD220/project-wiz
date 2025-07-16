import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import { llmProviders } from "../../../persistence/schemas";

import {
  createLlmProviderFromData,
  LlmProviderWithData,
} from "./llm-factory.functions";
import { findLlmProviderByName } from "./llm-query.functions";

import type { CreateLlmProviderDto } from "../../../../shared/types";

const logger = getLogger("llm-provider.create");

export async function createLlmProvider(
  data: CreateLlmProviderDto,
): Promise<LlmProviderWithData> {
  const existingProvider = await findLlmProviderByName(data.name);
  if (existingProvider) {
    throw new Error(`LLM provider with name '${data.name}' already exists`);
  }

  const providerData = buildProviderData(data);
  return saveNewProvider(providerData);
}

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
