/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('scene_performers', function(table) {
        table.increments('id').primary();
        table.integer('performer_id').unsigned().references('id').inTable('performers');
        table.integer('scene_id').unsigned().references('id').inTable('scenes');
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('scene_performers');
};
