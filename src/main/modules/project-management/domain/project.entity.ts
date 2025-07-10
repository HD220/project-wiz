import { BaseEntity } from "@/main/kernel/domain/base.entity";
import { z } from "zod";

export const ProjectPropsSchema = z.object({
  name: z.string().min(1, "Project name cannot be empty"),
  createdAt: z.date(),
});

export type ProjectProps = z.infer<typeof ProjectPropsSchema>;

export class Project extends BaseEntity<ProjectProps> {
  constructor(props: ProjectProps, id?: string) {
    ProjectPropsSchema.parse(props);
    super(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
