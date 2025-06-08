import { z } from "zod";
import { jobStatusSchema } from "../../domain/entities/job/value-objects/job-status.vo";

export const CreateJobInputSchema = z.object({
  name: z
    .string()
    .min(1, "O nome do job não pode estar vazio")
    .max(100, "O nome do job não pode exceder 100 caracteres"),
  payload: z
    .record(z.unknown())
    .optional()
    .describe("Dados específicos do job"),
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
    .optional(),
});

export type CreateJobUseCaseInput = z.infer<typeof CreateJobInputSchema>;

export const CreateJobOutputSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: jobStatusSchema,
  createdAt: z.date(),
});

export type CreateJobUseCaseOutput = z.infer<typeof CreateJobOutputSchema>;
