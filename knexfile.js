module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./.db/data.db",
    },
    useNullAsDefault: true,
    migrations: {
      directory: "./.db/migrations",
    },
    seeds: {
      directory: "./.db/seeds",
    },
  },
};