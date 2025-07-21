import { z } from "zod";

// Memory type validation
export const MemoryTypeSchema = z.enum([
  "conversation",
  "preference",
  "learning",
  "context",
  "fact",
]);

// Memory importance validation
export const MemoryImportanceSchema = z.enum([
  "low",
  "medium",
  "high",
  "critical",
]);

// Relation type validation
export const RelationTypeSchema = z.enum([
  "relates_to",
  "caused_by",
  "contradicts",
  "supports",
  "follows",
  "precedes",
]);

// Base memory creation schema
export const CreateMemorySchema = z.object({
  agentId: z.string().uuid("Agent ID must be a valid UUID"),
  userId: z.string().uuid("User ID must be a valid UUID"),
  conversationId: z
    .string()
    .uuid("Conversation ID must be a valid UUID")
    .optional(),

  // Memory content
  content: z
    .string()
    .min(1, "Content is required")
    .max(10000, "Content too long"),
  summary: z.string().max(500, "Summary too long").optional(),
  type: MemoryTypeSchema.default("conversation"),
  importance: MemoryImportanceSchema.default("medium"),

  // Scoring and retrieval
  importanceScore: z.number().min(0).max(1).default(0.5),

  // Context and metadata
  keywords: z.array(z.string()).max(20, "Too many keywords").optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Memory update schema
export const UpdateMemorySchema = z.object({
  content: z.string().min(1).max(10000).optional(),
  summary: z.string().max(500).optional(),
  type: MemoryTypeSchema.optional(),
  importance: MemoryImportanceSchema.optional(),
  importanceScore: z.number().min(0).max(1).optional(),
  keywords: z.array(z.string()).max(20).optional(),
  metadata: z.record(z.unknown()).optional(),
  isArchived: z.boolean().optional(),
});

// Memory search criteria schema
export const MemorySearchSchema = z.object({
  agentId: z.string().uuid("Agent ID must be a valid UUID"),
  userId: z.string().uuid("User ID must be a valid UUID"),
  query: z.string().max(200, "Query too long").optional(),
  type: MemoryTypeSchema.optional(),
  importance: MemoryImportanceSchema.optional(),
  conversationId: z.string().uuid().optional(),
  keywords: z.array(z.string()).max(10, "Too many search keywords").optional(),
  limit: z.number().int().min(1).max(100).default(50),
  includeArchived: z.boolean().default(false),
});

// Memory relation creation schema
export const CreateMemoryRelationSchema = z.object({
  sourceMemoryId: z.string().uuid("Source memory ID must be a valid UUID"),
  targetMemoryId: z.string().uuid("Target memory ID must be a valid UUID"),
  relationType: RelationTypeSchema.default("relates_to"),
  strength: z.number().min(0).max(1).default(0.5),
});

// Memory maintenance options schema
export const MemoryMaintenanceSchema = z.object({
  autoArchiveDays: z.number().int().min(1).max(365).default(90),
  minImportanceThreshold: z.number().min(0).max(1).default(0.3),
  maxMemoriesPerAgent: z.number().int().min(100).max(10000).default(1000),
  enableAutoLearning: z.boolean().default(true),
  memoryRetentionPolicy: z
    .enum(["none", "importance_based", "time_based", "hybrid"])
    .default("hybrid"),
});

// Memory analytics request schema
export const MemoryAnalyticsSchema = z.object({
  agentId: z.string().uuid("Agent ID must be a valid UUID"),
  userId: z.string().uuid("User ID must be a valid UUID"),
  dateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .optional(),
  includeArchived: z.boolean().default(false),
});

// Memory batch operations schema
export const BatchMemoryOperationSchema = z.object({
  operation: z.enum(["archive", "delete", "update_importance"]),
  memoryIds: z
    .array(z.string().uuid())
    .min(1, "At least one memory ID required")
    .max(50, "Too many memories for batch operation"),
  data: z.record(z.unknown()).optional(), // Additional data for the operation
});

// Memory export/import schemas
export const MemoryExportSchema = z.object({
  agentId: z.string().uuid("Agent ID must be a valid UUID"),
  userId: z.string().uuid("User ID must be a valid UUID"),
  includeArchived: z.boolean().default(false),
  format: z.enum(["json", "csv"]).default("json"),
});

export const MemoryImportSchema = z.object({
  agentId: z.string().uuid("Agent ID must be a valid UUID"),
  userId: z.string().uuid("User ID must be a valid UUID"),
  memories: z.array(CreateMemorySchema),
  skipValidation: z.boolean().default(false),
  overwriteExisting: z.boolean().default(false),
});

// Type exports for use in handlers and services
export type CreateMemoryInput = z.infer<typeof CreateMemorySchema>;
export type UpdateMemoryInput = z.infer<typeof UpdateMemorySchema>;
export type MemorySearchInput = z.infer<typeof MemorySearchSchema>;
export type CreateMemoryRelationInput = z.infer<
  typeof CreateMemoryRelationSchema
>;
export type MemoryMaintenanceOptions = z.infer<typeof MemoryMaintenanceSchema>;
export type MemoryAnalyticsRequest = z.infer<typeof MemoryAnalyticsSchema>;
export type BatchMemoryOperation = z.infer<typeof BatchMemoryOperationSchema>;
export type MemoryExportRequest = z.infer<typeof MemoryExportSchema>;
export type MemoryImportRequest = z.infer<typeof MemoryImportSchema>;
