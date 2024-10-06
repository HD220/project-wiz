import { IRepository } from "@/application/interfaces/IRepository";
import {
  GitRepositoryLink,
  gitRepositoryLinkSchema,
} from "@/application/domain/entities/GitRepositoryLink";
import { randomUUID } from "crypto";
import { IUseCase } from "../interfaces/IUseCase";

type Input = {
  url: string;
};
type Output = {
  [x: string]: string | number | boolean | Date | undefined;
};

export class CreateRepositoryLinkUseCase implements IUseCase<Input, Output> {
  private repo: IRepository<GitRepositoryLink>;
  constructor(repository: IRepository<GitRepositoryLink>) {
    this.repo = repository;
  }
  async execute(data?: Input): Promise<Output> {
    const { id = randomUUID(), ...repo } = gitRepositoryLinkSchema.parse(data);

    const project = await this.repo.save(
      new GitRepositoryLink({ id, ...repo })
    );
    return {
      id: project.id,
      name: project.name,
      owner: project.owner,
      isPrivate: project.isPrivate,
      url: project.url,
      sshUrl: project.sshUrl,
      cloneUrl: project.cloneUrl,
      defaultBranch: project.defaultBranch,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      description: project.description,
    };
  }
}
