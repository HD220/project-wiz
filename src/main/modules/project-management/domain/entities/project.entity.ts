import { BaseEntity } from "@/main/kernel/domain/base.entity";
import { z } from "zod";

export const ProjectPropsSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  localPath: z.string().min(1), // Absolute path to the project directory
  remoteUrl: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProjectProps = z.infer<typeof ProjectPropsSchema>;

export class Project extends BaseEntity<ProjectProps> {
  constructor(props: ProjectProps, id?: string) {
    const validatedProps = ProjectPropsSchema.parse(props);
    super(validatedProps, id);
  }

  // Update methods
  updateDetails(name: string, description?: string): void {
    this.props.name = name;
    this.props.description = description;
    this.touch();
  }

  updateLocalPath(path: string): void {
    this.props.localPath = path;
    this.touch();
  }

  updateRemoteUrl(url?: string): void {
    this.props.remoteUrl = url;
    this.touch();
  }

  // Getters
  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get localPath(): string {
    return this.props.localPath;
  }

  get remoteUrl(): string | undefined {
    return this.props.remoteUrl;
  }
}