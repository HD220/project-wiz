import { z } from "zod";
import { jobStatusSchema } from "../../domain/entities/job/value-objects/job-status.vo"; // Alterado para jobStatusSchema
import { activityContextPropsSchema } from "../../domain/entities/job/job.schema";
// Removido import de RetryPolicy

export const UpdateJobInputSchema = z.object({
  id: z.string().uuid("ID do job deve ser um UUID válido"),
  status: jobStatusSchema // Alterado para jobStatusSchema
    .optional()
    .describe("Novo status do job, se fornecido"),
  retryPolicy: z
    .object({
      maxRetries: z
        .number()
        .int()
        .min(1, "Número máximo de tentativas deve ser positivo"),
      delay: z
        .number()
        .int()
        .min(0, "Delay entre tentativas deve ser não-negativo"),
    })
    .optional()
    .describe("Política de retentativa, se fornecida"),
  activityType: z.string().optional(),
  context: activityContextPropsSchema.optional(),
  parentId: z.string().uuid().optional(),
  relatedActivityIds: z.array(z.string().uuid()).optional(),
});

export type UpdateJobUseCaseInput = z.infer<typeof UpdateJobInputSchema>;

export const UpdateJobOutputSchema = z.object({
  id: z.string().uuid(),
  name: z.string(), // Added name to output
  status: jobStatusSchema,
  updatedAt: z.date(),
  // Add other fields if they are part of the expected output
});

export type UpdateJobUseCaseOutput = z.infer<typeof UpdateJobOutputSchema>;
