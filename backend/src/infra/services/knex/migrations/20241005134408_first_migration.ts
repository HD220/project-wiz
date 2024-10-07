import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("git_repository_links", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.string("name", 500);
    table.enu("provider", ["github"]);
    table.string("description", 4000);
    table.string("owner", 500);
    table.boolean("is_private").defaultTo(false);
    table.string("url", 4000);
    table.string("ssh_url", 4000);
    table.string("clone_url", 4000);
    table.string("default_branch", 500);
    table.timestamps(true, true, false);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("git_repository_links");
}
