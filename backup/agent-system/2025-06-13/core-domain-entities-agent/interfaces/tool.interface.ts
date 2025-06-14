import { z } from "zod";

export interface Tool<T = any> {
  name: string;
  description: string;
  parameters: z.ZodType<T>;
  execute(params: T): Promise<any>;
}
