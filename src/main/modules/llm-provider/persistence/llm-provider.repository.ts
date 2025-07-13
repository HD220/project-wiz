import { eq, and, desc } from "drizzle-orm";
import { db } from "../../../persistence/db";
import { llmProviders, type LlmProviderSchema, type CreateLlmProviderSchema } from "../../../persistence/schemas";
import type { LlmProviderFilterDto } from "../../../../shared/types/llm-provider.types";

export class LlmProviderRepository {
  async save(data: CreateLlmProviderSchema): Promise<LlmProviderSchema> {
    const [llmProvider] = await db
      .insert(llmProviders)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    return llmProvider;
  }

  async findMany(filter?: LlmProviderFilterDto): Promise<LlmProviderSchema[]> {
    let query = db.select().from(llmProviders);

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

    return query.orderBy(desc(llmProviders.createdAt));
  }

  async findById(id: string): Promise<LlmProviderSchema | null> {
    const [llmProvider] = await db
      .select()
      .from(llmProviders)
      .where(eq(llmProviders.id, id))
      .limit(1);

    return llmProvider || null;
  }

  async update(id: string, data: Partial<CreateLlmProviderSchema>): Promise<LlmProviderSchema> {
    const [updated] = await db
      .update(llmProviders)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(llmProviders.id, id))
      .returning();

    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.delete(llmProviders).where(eq(llmProviders.id, id));
  }
}
