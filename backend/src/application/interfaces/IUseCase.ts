export interface IUseCase<Entitie> {
  save(entity: Partial<Entitie>): Promise<Entitie>;

  delete(pk: Entitie[keyof Entitie]): Promise<boolean>;

  findByPk(pk: Entitie[keyof Entitie]): Promise<Entitie>;

  find(
    criteria?: Partial<Entitie>,
    page?: number,
    page_size?: number
  ): Promise<{
    data: Entitie[];
    page: number;
    page_size: number;
    total_pages: number;
  }>;
}
