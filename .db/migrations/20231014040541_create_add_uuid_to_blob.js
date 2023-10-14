/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('blob', function(table) {
        table.string('stash_id').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.table('blob', function(table) {
        table.dropColumn('stash_id');
    });
};
