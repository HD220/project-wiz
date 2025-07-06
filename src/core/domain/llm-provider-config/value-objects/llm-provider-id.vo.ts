// src/core/domain/llm-provider-config/value-objects/llm-provider-id.vo.ts
import { z } from "zod";

import {
  AbstractValueObject,
  ValueObjectProps,
} from "@/core/common/value-objects/base.vo";

import { ValueError } from "../../common/errors";

const ALLOWED_PROVIDER_IDS = [
  "openai",
  "deepseek",
  "anthropic",
  "ollama",
  "mock",
];

const LLMProviderIdSchema = z
  .string()
  .trim()
  .min(1, "LLMProviderId cannot be empty.")
  .toLowerCase()
  .refine((id) => !id.includes(" "), "LLMProviderId should not contain spaces.")
  .refine((id) => {
    if (!ALLOWED_PROVIDER_IDS.includes(id)) {
      console.warn(
        `LLMProviderId: '${id}' is not in the predefined list. Ensure an adapter exists.`
      );
    }
    return true;
  }, "Unsupported LLMProviderId.");

interface LLMProviderIdProps extends ValueObjectProps {
  value: string;
}

export class LLMProviderId extends AbstractValueObject<LLMProviderIdProps> {
  private constructor(value: string) {
    super({ value });
  }

  public static create(providerId: string): LLMProviderId {
    const validationResult = LLMProviderIdSchema.safeParse(providerId);

    if (!validationResult.success) {
      const errorMessages = Object.values(
        validationResult.error.flatten().fieldErrors
      )
        .flat()
        .join("; ");
      throw new ValueError(`Invalid LLMProviderId format: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new LLMProviderId(validationResult.data);
  }

  public get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
