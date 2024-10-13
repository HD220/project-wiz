import { GenericRepository } from "@/infra/repositories/GenericRepository";
import { userModelSchema } from "../../knex/models/UserModel";
import { GenericUseCase } from "@/application/use-cases/GenericUseCase";
import { db } from "../../knex/db";
import { generateGenericRoutes } from "../controllers/generateGenericRoutes";
import { accountModelSchema } from "../../knex/models/AccountModel";
import { sessionModelSchema } from "../../knex/models/SessionModel";
import { verificationTokenModelSchema } from "../../knex/models/VerificationTokenModel";

const userRepository = new GenericRepository(
  db,
  "users",
  userModelSchema,
  "id"
);
const userUseCase = new GenericUseCase(userRepository);
export const userRoutes = generateGenericRoutes("/auth/users", userUseCase);

const accountRepository = new GenericRepository(
  db,
  "accounts",
  accountModelSchema,
  "id"
);
const accountUseCase = new GenericUseCase(accountRepository);
export const accountRoutes = generateGenericRoutes(
  "/auth/accounts",
  accountUseCase
);

const sessionRepository = new GenericRepository(
  db,
  "sessions",
  sessionModelSchema,
  "session_token"
);
const sessionUseCase = new GenericUseCase(sessionRepository);
export const sessionRoutes = generateGenericRoutes(
  "/auth/sessions",
  sessionUseCase
);

const verificationTokenRepository = new GenericRepository(
  db,
  "verification_tokens",
  verificationTokenModelSchema,
  "identifier"
);
const verificationTokenUseCase = new GenericUseCase(
  verificationTokenRepository
);
export const verificationTokenRoutes = generateGenericRoutes(
  "/auth/tokens",
  verificationTokenUseCase
);
