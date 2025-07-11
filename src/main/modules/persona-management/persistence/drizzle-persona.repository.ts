import { eq } from "drizzle-orm";
import { ApplicationError } from "@/main/errors/application.error";

import { Persona } from "@/main/modules/persona-management/domain/persona.entity";
import type { IPersonaRepository } from "@/main/modules/persona-management/domain/persona.repository";
import { BaseRepository } from "@/main/persistence/base.repository";
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type { InferSelectModel } from 'drizzle-orm';

import { personas } from "./schema";

export class DrizzlePersonaRepository extends BaseRepository<Persona, typeof personas> implements IPersonaRepository {
  constructor(db: BetterSQLite3Database<any>) {
    super(db, personas);
  }

  protected mapToDomainEntity(row: InferSelectModel<typeof personas>): Persona {
    return new Persona(
      {
        name: row.name,
        description: row.description,
        llmConfig: {
          model: row.llmModel,
          temperature: row.llmTemperature,
        },
        tools: row.tools as string[],
      },
      row.id,
    );
  }
}
