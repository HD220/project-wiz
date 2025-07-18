import { z } from "zod";

/**
 * Funções helper simples para Value Objects.
 * Elimina duplicação massiva mantendo simplicidade.
 */

export function createStringValueObject(schema: z.ZodString) {
  return class {
    private readonly value: string;

    constructor(value: string) {
      this.value = schema.parse(value);
    }

    getValue(): string {
      return this.value;
    }

    equals(other: { getValue(): string }): boolean {
      return this.value === other.getValue();
    }

    toString(): string {
      return this.value;
    }

    static isValid(value: string): boolean {
      try {
        schema.parse(value);
        return true;
      } catch {
        return false;
      }
    }
  };
}

export function createUuidValueObject() {
  const schema = z.string().uuid();
  return createStringValueObject(schema);
}

/**
 * Schemas reutilizáveis mais comuns
 */
export const CommonSchemas = {
  uuid: z.string().uuid(),
  name: z.string().min(2).max(100).trim(),
  email: z.string().email(),
  description: z.string().min(1).max(500).trim(),
  url: z.string().url(),
} as const;
