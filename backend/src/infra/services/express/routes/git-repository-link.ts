import { Router } from "express";
import { createController } from "@/infra/services/express/controllers/create-controller";
import { CreateRepositoryLinkUseCase } from "@/application/use-cases/CreateRepositoryLinkUseCase";
import { GitRepositoryLinkRepository } from "@/infra/repositories/GitRepositoryLinkRepository";
import { db } from "../../knex/db";

const repository = new GitRepositoryLinkRepository(db);
const createGitRepositoryLinkUseCase = new CreateRepositoryLinkUseCase(
  repository
);

const router = Router();

router.use(
  "/repositories",
  createController("POST", createGitRepositoryLinkUseCase)
);

export default router;
