import { Router } from "express";
import { gitRepositoryLinkRouter } from "@/infra/services/express/routes/git-repository-link";
import {
  accountRoutes,
  sessionRoutes,
  userRoutes,
  verificationTokenRoutes,
} from "./auth-route";
// import { authenticateJWT } from "../middlewares/authentication-middleware";

const router = Router();

// router.use(authenticateJWT)
router.use("/api", gitRepositoryLinkRouter);
router.use(userRoutes);
router.use(accountRoutes);
router.use(verificationTokenRoutes);
router.use(sessionRoutes);

export default router;
