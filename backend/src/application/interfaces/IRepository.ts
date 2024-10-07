import { Entitie } from "@/application/domain/entities/Entitie";

export interface IRepository<T extends Entitie> {
  save(entity: T): Promise<T>; //update,insert (upsert)

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
