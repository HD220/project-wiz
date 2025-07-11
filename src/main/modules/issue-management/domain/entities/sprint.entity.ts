import { BaseEntity } from "@/main/kernel/domain/base.entity";
import { z } from "zod";

export const SprintPropsSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(100),
  startDate: z.number().int().positive(),
  endDate: z.number().int().positive(),
  status: z.enum(["planned", "active", "completed"]),
});

export type SprintProps = z.infer<typeof SprintPropsSchema>;

export class Sprint extends BaseEntity<SprintProps> {
  constructor(props: SprintProps, id?: string) {
    const validatedProps = SprintPropsSchema.parse(props);
    super(validatedProps, id);
  }

  markAsActive(): void {
    this.props.status = "active";
    this.touch();
  }

  markAsCompleted(): void {
    this.props.status = "completed";
    this.touch();
  }
}
