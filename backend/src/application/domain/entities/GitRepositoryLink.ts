import { z } from "zod";
import { Entitie, entitieSchema } from "./Entitie";

export const gitRepositoryLinkSchema = entitieSchema.extend({
  name: z.coerce.string(),
  description: z.coerce.string().optional(),
  owner: z.coerce.string(),
  isPrivate: z.coerce.boolean(),
  url: z.coerce.string(),
  sshUrl: z.coerce.string(),
  cloneUrl: z.coerce.string(),
  defaultBranch: z.coerce.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type GitRepositoryLinkProps = z.infer<typeof gitRepositoryLinkSchema>;

export class GitRepositoryLink implements Entitie {
  private props: GitRepositoryLinkProps;

  constructor(props: GitRepositoryLinkProps) {
    this.props = {
      ...props,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
  }

  get id(): string | number {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get owner(): string {
    return this.props.owner;
  }

  get isPrivate(): boolean {
    return this.props.isPrivate;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get url(): string {
    return this.props.url;
  }

  get sshUrl(): string {
    return this.props.sshUrl;
  }

  get cloneUrl(): string {
    return this.props.cloneUrl;
  }

  get defaultBranch(): string {
    return this.props.defaultBranch;
  }

  public updateDescription(description: string): void {
    this.props.description = description;
    this.updateTimestamp();
  }

  private updateTimestamp(): void {
    this.props.updatedAt = new Date();
  }
}
