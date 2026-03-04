import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("transactions", (table) => {
    table.uuid("id").primary().notNullable();
    table.string("reference", 100).unique().notNullable();
    table
      .uuid("sender_wallet_id")
      .nullable()
      .references("id")
      .inTable("wallets")
      .onDelete("SET NULL");
    table
      .uuid("receiver_wallet_id")
      .nullable()
      .references("id")
      .inTable("wallets")
      .onDelete("SET NULL");
    table.decimal("amount", 15, 2).notNullable();
    table
      .enum("type", ["deposit", "transfer", "withdrawal"])
      .notNullable();
    table
      .enum("status", ["pending", "success", "failed"])
      .defaultTo("pending")
      .notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();

    table.index(["sender_wallet_id"]);
    table.index(["receiver_wallet_id"]);
    table.index(["reference"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("transactions");
}
