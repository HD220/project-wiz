import { z } from "zod";

export type UseCase = {
  execute: (params: UseCaseInput) => Promise<UseCaseOutput>;
};

export type UseCaseInput = {
  [x: string]: unknown;
};

export type UseCaseOutput = {
  [x: string]: unknown;
};

export const baseAPIInputSchema = z.object({
  page: z.coerce.number(),
  pageSize: z.coerce.number().optional(),
  query: z.coerce.string().optional(),
});

export type BaseAPIInput = z.infer<typeof baseAPIInputSchema>;
