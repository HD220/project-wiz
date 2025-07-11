import { BaseEntity } from "@/main/kernel/domain/base.entity";
import { z } from "zod";

export const IssuePropsSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  assignedToAgentId: z.string().uuid().optional(),
  createdByUserId: z.string().uuid().optional(),
});

export type IssueProps = z.infer<typeof IssuePropsSchema>;

export class Issue extends BaseEntity<IssueProps> {
  constructor(props: IssueProps, id?: string) {
    const validatedProps = IssuePropsSchema.parse(props);
    super(validatedProps, id);
  }

  assignToAgent(agentId: string): void {
    z.string().uuid().parse(agentId);
    this.props.assignedToAgentId = agentId;
    this.touch();
  }

  markAsInProgress(): void {
    this.props.status = "in_progress";
    this.touch();
  }

  markAsResolved(): void {
    this.props.status = "resolved";
    this.touch();
  }

  markAsClosed(): void {
    this.props.status = "closed";
    this.touch();
  }
}
