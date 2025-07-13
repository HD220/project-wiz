import { eq, and, desc } from "drizzle-orm";
import { db } from "../../../persistence/db";
import { llmProviders } from "./schema";
import { LlmProviderData } from "../entities/llm-provider.schema";

export interface LlmProviderFilterOptions {
  name?: string;
  provider?: string;
}

export class LlmProviderRepository {
  async save(data: LlmProviderData): Promise<LlmProviderData> {
    const [inserted] = await db
      .insert(llmProviders)
      .values({
        id: data.id,
        name: data.name,
        provider: data.provider,
        model: data.model,
        apiKey: data.apiKey,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
      .returning();

    return {
      ...inserted,
      createdAt: new Date(inserted.createdAt),
      updatedAt: new Date(inserted.updatedAt),
    };
  }

  async findMany(filter?: LlmProviderFilterOptions): Promise<LlmProviderData[]> {
    let query = db.select().from(llmProviders).orderBy(desc(llmProviders.createdAt));

    if (filter) {
      const conditions = [];

      if (filter.name) {
        conditions.push(eq(llmProviders.name, filter.name));
      }

      if (filter.provider) {
        conditions.push(eq(llmProviders.provider, filter.provider));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }

    const results = await query;

    return results.map((llmProvider) => ({
      ...llmProvider,
      createdAt: new Date(llmProvider.createdAt),
      updatedAt: new Date(llmProvider.updatedAt),
    }));
  }

  async findById(id: string): Promise<LlmProviderData | null> {
    const [result] = await db
      .select()
      .from(llmProviders)
      .where(eq(llmProviders.id, id))
      .limit(1);

    if (!result) {
      return null;
    }

    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }

  async update(data: LlmProviderData): Promise<LlmProviderData> {
    const [updated] = await db
      .update(llmProviders)
      .set({
        name: data.name,
        provider: data.provider,
        model: data.model,
        apiKey: data.apiKey,
        updatedAt: data.updatedAt,
      })
      .where(eq(llmProviders.id, data.id))
      .returning();

    return {
      ...updated,
      createdAt: new Date(updated.createdAt),
      updatedAt: new Date(updated.updatedAt),
    };
  }

  async delete(id: string): Promise<void> {
    await db.delete(llmProviders).where(eq(llmProviders.id, id));
  }
}
