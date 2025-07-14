import { z } from "zod";

import { ProjectSchema as ProjectData } from "../../../persistence/schemas/projects.schema";

// Create a basic validation schema for project
const ProjectValidationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  gitUrl: z.string().nullable().optional(),
  status: z.string().default("active"),
  avatar: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export class ProjectEntity {
  private props: ProjectData;

  constructor(data: Partial<ProjectData> | ProjectData) {
    // Convert data to match validation schema requirements
    const normalizedData = {
      ...data,
      createdAt:
        typeof data.createdAt === "string"
          ? data.createdAt
          : data.createdAt?.toISOString(),
      updatedAt:
        typeof data.updatedAt === "string"
          ? data.updatedAt
          : data.updatedAt?.toISOString(),
    };

    const parsed = ProjectValidationSchema.parse(normalizedData);

    // Convert back to proper ProjectData format
    this.props = {
      ...parsed,
      createdAt: parsed.createdAt ? new Date(parsed.createdAt) : new Date(),
      updatedAt: parsed.updatedAt ? new Date(parsed.updatedAt) : new Date(),
    } as ProjectData;
  }

  getId(): string {
    return this.props.id;
  }

  getName(): string {
    return this.props.name;
  }

  getDescription(): string | undefined {
    return this.props.description ?? undefined;
  }

  getGitUrl(): string | undefined {
    return this.props.gitUrl ?? undefined;
  }

  getStatus(): "active" | "inactive" | "archived" {
    return this.props.status;
  }

  getAvatar(): string | undefined {
    return this.props.avatar ?? undefined;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  updateName(data: { name: string }): void {
    const validated = z.object({ name: z.string().min(1) }).parse(data);
    this.props.name = validated.name;
    this.props.updatedAt = new Date();
  }

  updateDescription(data: { description?: string }): void {
    const validated = z
      .object({
        description: z.string().nullable().optional(),
      })
      .parse(data);
    this.props.description = validated.description ?? null;
    this.props.updatedAt = new Date();
  }

  updateGitUrl(data: { gitUrl?: string }): void {
    const validated = z
      .object({
        gitUrl: z.string().nullable().optional(),
      })
      .parse(data);
    this.props.gitUrl = validated.gitUrl ?? null;
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
