import { z } from "zod";
import { IUseCase } from "../interfaces/IUseCase";
import { IRepository } from "../interfaces/IRepository";

export class GenericUseCase<
  TableSchema extends z.AnyZodObject,
  Entitie extends z.infer<TableSchema>,
  Pk extends keyof Entitie,
> implements IUseCase<Entitie>
{
  constructor(private repository: IRepository<Entitie>) {}

  async save(entity: Partial<Entitie>): Promise<Entitie> {
    return await this.repository.save(entity);
  }

  async delete(id: Entitie[Pk]): Promise<boolean> {
    // Lógica adicional pode ser aplicada aqui, como validações
    return await this.repository.delete(id);
  }

  async find(
    criteria?: Partial<Entitie>,
    page: number = 1,
    page_size: number = 10
  ): Promise<{
    data: Entitie[];
    page: number;
    page_size: number;
    total_pages: number;
  }> {
    return await this.repository.find(criteria, page, page_size);
  }

  async findByPk(pk: Entitie[Pk]): Promise<Entitie> {
    return await this.repository.findByPk(pk);
  }
}
