import { IRepository } from "@/core/common/repository";
import { Persona } from "@/core/domain/entities/persona";

export type IPersonaRepository = IRepository<typeof Persona>;
