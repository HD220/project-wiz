export type PrimitivesTypes = string | number | Date | boolean | undefined;
export type InputType<T> = Record<string, T> | { [key: string]: string };
export type OutputType<T> = Record<string, T> | { [key: string]: string };

export type IUseCase<
  I extends InputType<PrimitivesTypes>,
  O extends OutputType<PrimitivesTypes>,
> = {
  execute: (args?: I) => Promise<O>;
};
