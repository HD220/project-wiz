// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = unknown> = new (...args: any[]) => T;
type ConstructorArgs<C extends Constructor> = ConstructorParameters<C>[0];
type Instance<C extends Constructor> = InstanceType<C>;

export interface IRepository<C extends Constructor> {
  create(props: Omit<ConstructorArgs<C>, "id">): Promise<Instance<C>>;
  load(
    id: ConstructorArgs<C> extends { id: infer ID } ? ID : never
  ): Promise<Instance<C>>;
  save(entity: Instance<C>): Promise<Instance<C>>;
  list(): Promise<Instance<C>[]>;
  delete(
    id: ConstructorArgs<C> extends { id: infer ID } ? ID : never
  ): Promise<void>;
}
