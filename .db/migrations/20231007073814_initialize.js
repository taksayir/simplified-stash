/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("blob", function (table) {
      table.increments("id").primary();
      table.text("data");
      table.timestamp("timestamp").defaultTo(knex.fn.now());
    })
    .createTable("files", function (table) {
      table.increments("id").primary();
      table.string("path");
      table.string("phash");
      table.integer("cover_id").unsigned();
      table.foreign("cover_id").references("blob.id");
      table.timestamps(true, true);
    })
    .createTable("scenes", function (table) {
      table.increments("id").primary();
      table.string("phash").unique().notNullable();
      table.string("title");
      table.string("details");
      table.integer("cover_id").unsigned();
      table.foreign("cover_id").references("blob.id");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("files").dropTable("blob").dropTable("scene");
};
