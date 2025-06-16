import { IRepository } from "@/core/common/repository";
import { Agent } from "@/core/domain/entities/agent";

export type IAgentRepository = IRepository<typeof Agent>;
