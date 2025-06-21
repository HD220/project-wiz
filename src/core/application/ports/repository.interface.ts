// This is a basic generic interface. Specific repositories might have more specialized methods.
export interface IRepository<T, ID> {
  findById(id: ID): Promise<T | null>;
  save(entity: T): Promise<void>;
  // delete(id: ID): Promise<void>; // Optional
  // findAll?(): Promise<T[]>; // Optional
}
