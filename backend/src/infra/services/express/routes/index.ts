import { Router } from "express";
import gitRepositoryLinkRouter from "@/infra/services/express/routes/git-repository-link";
import { authenticateJWT } from "../middlewares/authentication-middleware";

const router = Router();

router.use(authenticateJWT)
router.use(gitRepositoryLinkRouter);

export default router;
