import { IRepository } from "@/core/common/repository";
import { User } from "@/core/domain/entities/user";

export type IUserRepository = IRepository<typeof User>;
