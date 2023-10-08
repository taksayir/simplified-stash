import knex from "knex";

export const getDb  = () => {
    const db = knex({
        client: 'better-sqlite3',
        connection: {
          filename: './.db/data.db'
        },
        useNullAsDefault: true
      });
    return db
}