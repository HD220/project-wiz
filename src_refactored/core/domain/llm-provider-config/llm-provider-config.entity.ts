// src_refactored/core/domain/llm-provider-config/llm-provider-config.entity.ts
import { z } from "zod";

import { AbstractEntity, EntityProps } from "@/core/common/base.entity";

import { EntityError } from "@/domain/common/errors";

import { LLMApiKey } from './value-objects/llm-api-key.vo';
import { LLMProviderConfigId } from './value-objects/llm-provider-config-id.vo';
import { LLMProviderConfigName } from './value-objects/llm-provider-config-name.vo';
import { LLMProviderId } from './value-objects/llm-provider-id.vo';

export interface LLMProviderConfigCreationProps {
  name: LLMProviderConfigName;
  providerId: LLMProviderId;
  apiKey?: LLMApiKey;
  baseUrl?: string;
}

export interface LLMProviderConfigProps extends LLMProviderConfigCreationProps {
  id: LLMProviderConfigId;
  createdAt?: Date;
  updatedAt?: Date;
}

const LLMProviderConfigPropsSchema = z.object({
  id: z.custom<LLMProviderConfigId>((val) => val instanceof LLMProviderConfigId).optional(),
  name: z.custom<LLMProviderConfigName>((val) => val instanceof LLMProviderConfigName),
  providerId: z.custom<LLMProviderId>((val) => val instanceof LLMProviderId),
  apiKey: z.custom<LLMApiKey>((val) => val instanceof LLMApiKey).optional(),
  baseUrl: z.string().url().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

interface InternalLLMProviderConfigProps extends EntityProps<LLMProviderConfigId> {
  name: LLMProviderConfigName;
  providerId: LLMProviderId;
  apiKey?: LLMApiKey | null;
  baseUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class LLMProviderConfig extends AbstractEntity<LLMProviderConfigId, InternalLLMProviderConfigProps> {
  private constructor(props: InternalLLMProviderConfigProps) {
    super(props);
  }

  public static create(props: LLMProviderConfigCreationProps): LLMProviderConfig {
    const validationResult = LLMProviderConfigPropsSchema.safeParse(props);
    if (!validationResult.success) {
      const errorMessages = Object.values(validationResult.error.flatten().fieldErrors).flat().join('; ');
      throw new EntityError(`Invalid LLMProviderConfig props: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }

    const now = new Date();
    const internalProps: InternalLLMProviderConfigProps = {
      id: LLMProviderConfigId.generate(),
      name: props.name,
      providerId: props.providerId,
      apiKey: props.apiKey === undefined ? null : props.apiKey,
      baseUrl: props.baseUrl === undefined ? null : props.baseUrl,
      createdAt: now,
      updatedAt: now,
    };

    return new LLMProviderConfig(internalProps);
  }

  public get name(): LLMProviderConfigName {
    return this.props.name;
  }

  public get providerId(): LLMProviderId {
    return this.props.providerId;
  }

  public get apiKeyForAdapter(): string {
    return this.props.apiKey ? this.props.apiKey.value : '';
  }

  public get baseUrl(): string | null | undefined {
    return this.props.baseUrl;
  }

  public changeName(newName: LLMProviderConfigName): LLMProviderConfig {
    const newProps = { ...this.props, name: newName, updatedAt: new Date() };
    return new LLMProviderConfig(newProps);
  }

  public changeApiKey(newApiKey: LLMApiKey): LLMProviderConfig {
    const newProps = { ...this.props, apiKey: newApiKey, updatedAt: new Date() };
    return new LLMProviderConfig(newProps);
  }

  public changeBaseUrl(newBaseUrl?: string): LLMProviderConfig {
    const newProps = { ...this.props, baseUrl: newBaseUrl, updatedAt: new Date() };
    return new LLMProviderConfig(newProps);
  }
}

