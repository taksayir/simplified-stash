/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return Promise.all([
        knex.schema.table('scenes', function(table) {
            table.string('stash_id');
            table.timestamp('last_sync_at');
        }),
        knex.schema.table('performers', function(table) {
            table.string('stash_id');
            table.timestamp('last_sync_at');
        }),
        knex.schema.table('scene_performers', function(table) {
            table.string('stash_id');
            table.timestamp('last_sync_at');
        })
    ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return Promise.all([
        knex.schema.table('scenes', function(table) {
            table.dropColumn('stash_id');
            table.dropColumn('last_sync_at');
        }),
        knex.schema.table('performers', function(table) {
            table.dropColumn('stash_id');
            table.dropColumn('last_sync_at');
        }),
        knex.schema.table('scene_performers', function(table) {
            table.dropColumn('stash_id');
            table.dropColumn('last_sync_at');
        })
    ]);
};
