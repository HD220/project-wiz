import "knex/types/result";

declare module "knex/types/result" {
  export interface Registry {
    Count: number;
  }
}
