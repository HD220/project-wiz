import { z } from "zod";

// Schemas consolidados
const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().default(""),
  gitUrl: z.string().url().optional().nullable(),
  status: z.enum(["active", "archived", "maintenance"]).default("active"),
  avatar: z.string().nullable().default(null),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

const ChannelSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  description: z.string().default(""),
  projectId: z.string().uuid(),
  isGeneral: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type ProjectData = z.infer<typeof ProjectSchema>;
export type ChannelData = z.infer<typeof ChannelSchema>;

export class Project {
  constructor(private data: ProjectData) {
    this.data = ProjectSchema.parse(data);
  }

  // Getters essenciais
  getId(): string {
    return this.data.id;
  }
  getName(): string {
    return this.data.name;
  }
  getDescription(): string {
    return this.data.description;
  }
  getGitUrl(): string | null {
    return this.data.gitUrl || null;
  }
  getStatus(): string {
    return this.data.status;
  }
  getAvatar(): string | null {
    return this.data.avatar;
  }
  getCreatedAt(): Date {
    return this.data.createdAt;
  }
  getUpdatedAt(): Date {
    return this.data.updatedAt;
  }

  // Lógica de negócio
  isActive(): boolean {
    return this.data.status === "active";
  }

  isArchived(): boolean {
    return this.data.status === "archived";
  }

  hasGitRepository(): boolean {
    return !!this.data.gitUrl;
  }

  // Operações de estado
  archive(): Project {
    return new Project({
      ...this.data,
      status: "archived",
      updatedAt: new Date(),
    });
  }

  activate(): Project {
    return new Project({
      ...this.data,
      status: "active",
      updatedAt: new Date(),
    });
  }

  setMaintenance(): Project {
    return new Project({
      ...this.data,
      status: "maintenance",
      updatedAt: new Date(),
    });
  }

  // Atualização de dados
  updateInfo(
    updates: Partial<
      Pick<ProjectData, "name" | "description" | "gitUrl" | "avatar">
    >,
  ): Project {
    return new Project({
      ...this.data,
      ...updates,
      updatedAt: new Date(),
    });
  }

  // Touch para atualizar timestamp
  touch(): Project {
    return new Project({
      ...this.data,
      updatedAt: new Date(),
    });
  }

  // Conversão para dados persistidos
  toData(): ProjectData {
    return { ...this.data };
  }

  toPlainObject() {
    return this.toData();
  }

  // Comparação
  equals(other: Project): boolean {
    return this.data.id === other.data.id;
  }

  // Factory
  static create(props: {
    id?: string;
    name: string;
    description?: string;
    gitUrl?: string | null;
    status?: "active" | "archived" | "maintenance";
    avatar?: string | null;
  }): Project {
    const now = new Date();
    return new Project({
      id: props.id || crypto.randomUUID(),
      name: props.name,
      description: props.description || "",
      gitUrl: props.gitUrl || null,
      status: props.status || "active",
      avatar: props.avatar || null,
      createdAt: now,
      updatedAt: now,
    });
  }
}

export class Channel {
  constructor(private data: ChannelData) {
    this.data = ChannelSchema.parse(data);
  }

  // Getters essenciais
  getId(): string {
    return this.data.id;
  }
  getName(): string {
    return this.data.name;
  }
  getDescription(): string {
    return this.data.description;
  }
  getProjectId(): string {
    return this.data.projectId;
  }
  isGeneral(): boolean {
    return this.data.isGeneral;
  }
  getCreatedAt(): Date {
    return this.data.createdAt;
  }
  getUpdatedAt(): Date {
    return this.data.updatedAt;
  }

  // Lógica de negócio
  canDelete(): boolean {
    return !this.data.isGeneral; // Canal geral não pode ser deletado
  }

  // Atualização de dados
  updateInfo(
    updates: Partial<Pick<ChannelData, "name" | "description">>,
  ): Channel {
    return new Channel({
      ...this.data,
      ...updates,
      updatedAt: new Date(),
    });
  }

  // Conversão para dados persistidos
  toData(): ChannelData {
    return { ...this.data };
  }

  // Comparação
  equals(other: Channel): boolean {
    return this.data.id === other.data.id;
  }

  // Factory
  static create(props: {
    id?: string;
    name: string;
    description?: string;
    projectId: string;
    isGeneral?: boolean;
  }): Channel {
    const now = new Date();
    return new Channel({
      id: props.id || crypto.randomUUID(),
      name: props.name,
      description: props.description || "",
      projectId: props.projectId,
      isGeneral: props.isGeneral || false,
      createdAt: now,
      updatedAt: now,
    });
  }

  static createGeneral(projectId: string): Channel {
    return Channel.create({
      name: "general",
      description: "Canal geral do projeto",
      projectId,
      isGeneral: true,
    });
  }
}
