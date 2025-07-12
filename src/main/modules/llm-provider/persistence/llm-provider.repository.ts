import { LlmProviderDto, CreateLlmProviderDto, UpdateLlmProviderDto } from "../../../../shared/types/llm-provider.types";
import { LlmProviderSchema, llmProviders } from "./schema";
import { db } from "../../../persistence/db";
import { eq } from "drizzle-orm";

export class LlmProviderRepository {
  async create(provider: CreateLlmProviderDto): Promise<LlmProviderDto> {
    const [result] = await db.insert(llmProviders).values(provider).returning();
    return this.mapToDto(result);
  }

  async findById(id: string): Promise<LlmProviderDto | null> {
    const [result] = await db.select().from(llmProviders).where(eq(llmProviders.id, id));
    return result ? this.mapToDto(result) : null;
  }

  async findAll(): Promise<LlmProviderDto[]> {
    const result = await db.select().from(llmProviders);
    return result.map(this.mapToDto);
  }

  async update(id: string, provider: UpdateLlmProviderDto): Promise<LlmProviderDto | null> {
    const [result] = await db.update(llmProviders).set(provider).where(eq(llmProviders.id, id)).returning();
    return result ? this.mapToDto(result) : null;
  }

  async delete(id: string): Promise<void> {
    await db.delete(llmProviders).where(eq(llmProviders.id, id));
  }

  private mapToDto(schema: LlmProviderSchema): LlmProviderDto {
    return {
      id: schema.id,
      name: schema.name,
      provider: schema.provider,
      model: schema.model,
      apiKey: schema.apiKey,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    };
  }
}
