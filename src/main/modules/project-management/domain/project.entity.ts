import { z } from "zod";
import {
  ProjectSchema as ProjectData,
} from "../../../persistence/schemas/projects.schema";

// Create a basic validation schema for project
const ProjectValidationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  gitUrl: z.string().optional(),
  status: z.string().default('active'),
  avatar: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export class ProjectEntity {
  private props: ProjectData;

  constructor(data: Partial<ProjectData> | ProjectData) {
    this.props = ProjectValidationSchema.parse(data) as ProjectData;
  }

  getId(): string {
    return this.props.id;
  }

  getName(): string {
    return this.props.name;
  }

  getDescription(): string | undefined {
    return this.props.description;
  }

  getGitUrl(): string | undefined {
    return this.props.gitUrl;
  }

  getStatus(): "active" | "inactive" | "archived" {
    return this.props.status;
  }

  getAvatar(): string | undefined {
    return this.props.avatar;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  updateName(data: { name: string }): void {
    const validated = z.object({ name: ProjectSchema.shape.name }).parse(data);
    this.props.name = validated.name;
    this.props.updatedAt = new Date();
  }

  updateDescription(data: { description?: string }): void {
    const validated = z
      .object({
        description: ProjectSchema.shape.description,
      })
      .parse(data);
    this.props.description = validated.description;
    this.props.updatedAt = new Date();
  }

  updateGitUrl(data: { gitUrl?: string }): void {
    const validated = z
      .object({
        gitUrl: ProjectSchema.shape.gitUrl,
      })
      .parse(data);
    this.props.gitUrl = validated.gitUrl;
    this.props.updatedAt = new Date();
  }

  archive(): void {
    this.props.status = "archived";
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.status = "active";
    this.props.updatedAt = new Date();
  }

  toPlainObject(): ProjectData {
    return { ...this.props };
  }
}