export type ResultSuccess<T> = {
  success: true;
  data: T;
};
export type ResultError = {
  success: false;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
};

export type Result<T> = ResultSuccess<T> | ResultError;

export const OK = <T>(value: T): ResultSuccess<T> => ({
  success: true,
  data: value,
});
export const NOK = <E extends Error>(error: E): ResultError => ({
  success: false,
  error: {
    message: error.message,
    name: error.name,
    stack: error.stack,
  },
});
