export interface IRepository<T> {
  save(entity: Partial<T>): Promise<T>;

  delete(pk: T[keyof T]): Promise<boolean>;

  findByPk(pk: T[keyof T]): Promise<T>;

  find(
    criteria?: Partial<T>,
    page?: number,
    page_size?: number
  ): Promise<{
    data: T[];
    page: number;
    page_size: number;
    total_pages: number;
  }>;

  count(criteria?: Partial<T>): Promise<number>;
}
