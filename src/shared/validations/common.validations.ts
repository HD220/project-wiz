import { z } from "zod";

// Validations for common patterns used across domains
export const CommonValidations = {
  // UUID validation
  uuid: z.string().uuid("Invalid UUID format"),

  // Name validation (project names, agent names, etc.)
  name: z.string().min(1, "Name cannot be empty").max(100, "Name too long"),

  // Short name validation (channel names, etc.)
  shortName: z.string().min(1, "Name cannot be empty").max(50, "Name too long"),

  // Description validation
  description: z.string().max(500, "Description too long").default(""),

  // URL validation
  url: z.string().url("Invalid URL format").optional().nullable(),

  // Status validation for common statuses
  status: z
    .enum(["active", "inactive", "archived", "maintenance"])
    .default("active"),

  // Boolean with default
  boolean: (defaultValue: boolean = false) => z.boolean().default(defaultValue),

  // Date validation
  date: z.date().default(() => new Date()),

  // Email validation
  email: z.string().email("Invalid email format"),

  // Non-empty string
  nonEmptyString: z.string().min(1, "Cannot be empty"),

  // Optional string
  optionalString: z.string().optional().nullable(),

  // Positive number
  positiveNumber: z.number().positive("Must be positive"),

  // Temperature validation (for LLM)
  temperature: z.number().min(0).max(2).default(0.7),

  // Max tokens validation (for LLM)
  maxTokens: z.number().positive().max(100000).default(1000),
} as const;

// Utility function to create timestamps
export const createTimestamps = () => ({
  createdAt: CommonValidations.date,
  updatedAt: CommonValidations.date,
});

// Utility function to create entity with ID
export const createEntitySchema = <T extends z.ZodRawShape>(fields: T) => {
  return z.object({
    id: CommonValidations.uuid,
    ...fields,
    ...createTimestamps(),
  });
};

// Utility function to create update schema (all fields optional except id)
export const createUpdateSchema = <T extends z.ZodRawShape>(fields: T) => {
  return z.object({
    id: CommonValidations.uuid,
    ...Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [
        key,
        (value as z.ZodType).optional(),
      ]),
    ),
    updatedAt: CommonValidations.date,
  });
};
