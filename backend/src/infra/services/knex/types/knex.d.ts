import "knex";
declare module "knex" {
  namespace Knex {
    interface SchemaBuilder {
      functionName(): Knex.SchemaBuilder;
    }
    interface TableBuilder {
      functionName(): Knex.TableBuilder;
    }
    interface ViewBuilder {
      functionName(): Knex.ViewBuilder;
    }
    interface ColumnBuilder {
      functionName(): Knex.ColumnBuilder;
    }
  }
}
