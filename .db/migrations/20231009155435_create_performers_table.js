/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('performers', function(table) {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('gender').notNullable();
        table.integer('birth_year').nullable();
        table.string('ethnicity').nullable();
        table.string('country').nullable();
        table.integer('cover_id').unsigned().references('id').inTable('blob');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('performers');
};
