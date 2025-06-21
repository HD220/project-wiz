import { z } from "zod";
import { JobId } from "./value-objects/job-id.vo";
import { JobStatus, jobStatusSchema as jobStatusEnumTypeSchema } from "./value-objects/job-status.vo"; // Renamed import for clarity
import { RetryPolicy } from "./value-objects/retry-policy.vo";
import { NoRetryPolicy } from "./value-objects/no-retry-policy";
import { IRetryPolicy } from "./value-objects/retry-policy.interface";
import { ActivityType, ActivityTypes } from "./value-objects/activity-type.vo"; // Keep ActivityTypes for enum if used elsewhere
import { ActivityContext } from "./value-objects/activity-context.vo";
import { JobName } from "./value-objects/job-name.vo";
import { AttemptCount } from "./value-objects/attempt-count.vo";
import { JobTimestamp } from "./value-objects/job-timestamp.vo";
import { JobPriority } from "./value-objects/job-priority.vo";
import { JobDependsOn } from "./value-objects/job-depends-on.vo";
import { RelatedActivityIds } from "./value-objects/related-activity-ids.vo";
import { AgentId } from "../../agent/value-objects/agent-id.vo"; // Added import
// Import new VOs for ActivityHistoryEntry, but also the enum for validation
import { EntryRole, ValidEntryRoles } from "./value-objects/entry-role.vo";
import { EntryContent } from "./value-objects/entry-content.vo";
// VOs for ActivityContextPropsSchema
import { ActivityNotes } from "./value-objects/activity-notes.vo";
import { ActivityHistory } from "./value-objects/activity-history.vo";
import { ValidationStatusType } from "./value-objects/context-parts/validation-status.vo";
// import { ActivityHistoryEntry } from "./value-objects/activity-history-entry.vo";

export const activityHistoryEntrySchema = z.object({
  role: z.nativeEnum(ValidEntryRoles), // Validates against the string enum values
  content: z.string().min(1, "O conteúdo (content) não pode ser vazio."), // Validates primitive string
  timestamp: z.date({ // Validates primitive Date
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
  activityNotes: z.instanceof(ActivityNotes).optional(), // Changed: Accepts ActivityNotes instance
  validationCriteria: z.array(z.string()).optional(),
  validationResult: z.nativeEnum(ValidationStatusType).optional(), // Changed: Validates against the string enum
  activityHistory: z.instanceof(ActivityHistory), // Changed: Accepts ActivityHistory instance, non-optional, no default
});

export const jobSchema = z.object({
  id: z.instanceof(JobId),
  name: z.instanceof(JobName), // Changed
  status: z.instanceof(JobStatus), // Changed
  attempts: z.instanceof(AttemptCount), // Changed
  retryPolicy: z.custom<IRetryPolicy>((val) =>
    typeof val === 'object' &&
    val !== null &&
    'calculateDelay' in val &&
    'shouldRetry' in val
  ), // Changed, non-optional
  createdAt: z.instanceof(JobTimestamp), // Changed
  updatedAt: z.instanceof(JobTimestamp).optional(), // Changed
  payload: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
  data: z.record(z.unknown()).optional(),
  result: z.unknown().optional(),
  priority: z.instanceof(JobPriority).optional(), // Changed, default removed
  dependsOn: z.instanceof(JobDependsOn).optional(), // Changed, default removed
  activityType: z.instanceof(ActivityType).optional(), // Changed
  context: z.instanceof(ActivityContext).optional(), // Changed
  parentId: z.instanceof(JobId).optional(), // Changed
  relatedActivityIds: z.instanceof(RelatedActivityIds).optional(), // Changed, default removed
  agentId: z.instanceof(AgentId).optional(), // Added agentId
});
