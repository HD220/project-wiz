import { GenericUseCase } from "@/application/use-cases/GenericUseCase";
import { GenericRepository } from "@/infra/repositories/GenericRepository";
import { db } from "../../knex/db";
import { gitRepositoryLinkModelSchema } from "../../knex/models/GitRepositoryLinkModel";
import { generateGenericRoutes } from "../controllers/generateGenericRoutes";

const gitRepositoryRepository = new GenericRepository(
  db,
  "git_repository_links",
  gitRepositoryLinkModelSchema,
  "id"
);
const gitRepositoryUseCase = new GenericUseCase(gitRepositoryRepository);

export const gitRepositoryLinkRouter = generateGenericRoutes(
  "/repositories",
  gitRepositoryUseCase
);
