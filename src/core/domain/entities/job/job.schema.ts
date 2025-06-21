import { z } from "zod";
import { JobId } from "./value-objects/job-id.vo";
import { jobStatusSchema } from "./value-objects/job-status.vo";
import { RetryPolicy } from "./value-objects/retry-policy.vo";
import { ActivityTypes } from "./value-objects/activity-type.vo";
import { ActivityHistoryEntry } from "./value-objects/activity-history-entry.vo";

export const activityHistoryEntrySchema = z.object({
  role: z.string().min(1, "O papel (role) não pode ser vazio."),
  content: z.string().min(1, "O conteúdo (content) não pode ser vazio."),
  timestamp: z.date({
    required_error: "O carimbo de data/hora (timestamp) é obrigatório.",
    invalid_type_error:
      "O carimbo de data/hora (timestamp) deve ser uma data válida.",
  }),
});

export const activityContextPropsSchema = z.object({
  messageContent: z.string().optional(),
  sender: z.string().optional(),
  toolName: z.string().optional(),
  toolArgs: z.record(z.unknown()).optional(),
  goalToPlan: z.string().optional(),
  plannedSteps: z.array(z.string()).optional(),
  activityNotes: z.array(z.string()).optional(),
  validationCriteria: z.array(z.string()).optional(),
  validationResult: z.enum(["PASSED", "FAILED", "PENDING"]).optional(),
  activityHistory: z.array(activityHistoryEntrySchema).default([]),
});

export const jobSchema = z.object({
  id: z.instanceof(JobId),
  name: z.string().min(1),
  status: jobStatusSchema,
  attempts: z.number().min(0),
  retryPolicy: z.instanceof(RetryPolicy).optional(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  payload: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
  data: z.record(z.unknown()).optional(),
  result: z.unknown().optional(),
  priority: z.number().int().min(0).default(0),
  dependsOn: z.array(z.string().uuid()).default([]),
  activityType: z.nativeEnum(ActivityTypes).optional(),
  context: activityContextPropsSchema.optional(),
  parentId: z.string().uuid().optional(),
  relatedActivityIds: z.array(z.string().uuid()).optional().default([]),
});
