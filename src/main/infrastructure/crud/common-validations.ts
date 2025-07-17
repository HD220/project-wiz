import { z } from "zod";

export const commonValidations = {
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().default(""),
  email: z.string().email(),
  url: z.string().url().optional(),
  timestamps: {
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
  },
};

type EntitySchemaFields = Record<string, z.ZodTypeAny>;

export function createEntitySchema<T extends EntitySchemaFields>(
  fields: T,
): z.ZodObject<
  T & {
    id: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
  }
> {
  return z.object({
    id: commonValidations.id,
    ...fields,
    createdAt: commonValidations.timestamps.createdAt,
    updatedAt: commonValidations.timestamps.updatedAt,
  });
}
