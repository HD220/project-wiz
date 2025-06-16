import { IRepository } from "@/core/common/repository";
import { Persona } from "@/core/domain/entities/agent/value-objects/persona";

export type IPersonaRepository = IRepository<typeof Persona>;
