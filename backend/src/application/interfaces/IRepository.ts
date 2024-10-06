import { Entitie } from "@/application/domain/entities/Entitie";
import { OnlyProperties } from "./utils";

export interface IRepository<T extends Entitie> {
  save(entity: OnlyProperties<T>): Promise<T>; //update,insert (upsert)

  findById(id: string | number): Promise<T | null>;

  findAll(
    page?: number,
    pageSize?: number
  ): Promise<{ data: T[]; total: number }>;

  delete(id: string | number): Promise<boolean>;

  findByCriteria(
    criteria: Partial<T>,
    page?: number,
    pageSize?: number
  ): Promise<{ data: T[]; total: number }>;

  count(criteria?: Partial<T>): Promise<number>;
}
