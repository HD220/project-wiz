// src/core/common/value-objects/identity.vo.ts
import { randomUUID } from "crypto";

import { z } from "zod";

import { ValueError } from "@/core/domain/common/errors";

import { AbstractValueObject, ValueObjectProps } from "./base.vo";

const IdentitySchema = z.string().uuid("Invalid UUID format.");

interface IdentityProps extends ValueObjectProps {
  value: string;
}

export class Identity extends AbstractValueObject<IdentityProps> {
  protected constructor(value: string) {
    const validationResult = IdentitySchema.safeParse(value);
    if (!validationResult.success) {
      const errorMessages = Object.values(
        validationResult.error.flatten().fieldErrors
      )
        .flat()
        .join("; ");
      throw new ValueError(`Invalid Identity format: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    super({ value: validationResult.data });
  }

  public static generate(): Identity {
    return new Identity(randomUUID());
  }

  public static fromString(value: string): Identity {
    return new Identity(value);
  }

  public get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
