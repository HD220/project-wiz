import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("users", (table) => {
      table.uuid("id").defaultTo(knex.fn.uuid()).primary();
      table.text("name");
      table.text("email").unique();
      table.timestamp("email_verified");
      table.text("image");
      table.timestamps(true, true, false);
    })
    .createTable("accounts", (table) => {
      table.uuid("id").defaultTo(knex.fn.uuid()).primary();
      table.uuid("user_id");
      table.text("type").notNullable();
      table.text("provider").notNullable();
      table.text("provider_account_id").notNullable();
      table.text("refresh_token");
      table.text("access_token");
      table.bigInteger("expires_at");
      table.bigInteger("expires_in");
      table.text("token_type");
      table.text("scope");
      table.text("id_token");
      table.text("session_state");
      table.string("password", 512).nullable();
      table.unique(["provider", "provider_account_id"]);
      table.foreign("user_id").references("id").inTable("users");
      table.timestamps(true, true, false);
    })
    .createTable("sessions", (table) => {
      table.text("session_token").notNullable().unique();
      table.timestamp("expires").notNullable();
      table.uuid("user_id");
      table.foreign("user_id").references("id").inTable("users");
      table.timestamps(true, true, false);
    })
    .createTable("verification_tokens", (table) => {
      table.text("identifier");
      table.string("token", 255).primary();
      table.timestamp("expires").notNullable();
      table.primary(["token", "identifier"]);
      table.timestamps(true, true, false);
    })
    .createTable("git_repository_links", (table) => {
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
  return knex.schema
    .dropTable("verificationToken")
    .dropTable("session")
    .dropTable("account")
    .dropTable("user")
    .dropTable("git_repository_links");
}
