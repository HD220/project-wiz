type Constructor<T = any> = new (...args: any[]) => T;
type ConstructorArgs<C extends Constructor> = ConstructorParameters<C>[0];
type Instance<C extends Constructor> = InstanceType<C>;

export interface IRepository<C extends Constructor> {
  create(props: Omit<ConstructorArgs<C>, "id">): Promise<Instance<C>>;
  load(id: ConstructorArgs<C>["id"]): Promise<Instance<C>>;
  save(entity: Instance<C>): Promise<ConstructorArgs<C>["id"]>;
  list(): Promise<Instance<C>[]>;
  delete(id: ConstructorArgs<C>["id"]): Promise<void>;
}
