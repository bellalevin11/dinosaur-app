const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.USER,
  host: "localhost",
  database: "dino_db",
  port: 5432,
});

module.exports = pool;