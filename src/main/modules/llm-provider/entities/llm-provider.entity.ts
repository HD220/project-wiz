import { z } from "zod";
import {
  LlmProviderSchema,
  type LlmProviderData,
} from "./llm-provider.schema";

export class LlmProviderEntity {
  private props: LlmProviderData;

  constructor(data: Partial<LlmProviderData> | LlmProviderData) {
    this.props = LlmProviderSchema.parse(data);
  }

  getId(): string {
    return this.props.id;
  }

  getName(): string {
    return this.props.name;
  }

  getProvider(): string {
    return this.props.provider;
  }

  getModel(): string {
    return this.props.model;
  }

  getApiKey(): string {
    return this.props.apiKey;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  updateName(data: { name: string }): void {
    const validated = z.object({ name: LlmProviderSchema.shape.name }).parse(data);
    this.props.name = validated.name;
    this.props.updatedAt = new Date();
  }

  updateApiKey(data: { apiKey: string }): void {
    const validated = z.object({ apiKey: LlmProviderSchema.shape.apiKey }).parse(data);
    this.props.apiKey = validated.apiKey;
    this.props.updatedAt = new Date();
  }

  toPlainObject(): LlmProviderData {
    return { ...this.props };
  }
}
