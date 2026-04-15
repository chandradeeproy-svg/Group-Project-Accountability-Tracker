"use strict";

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DataBase_URL,
  max: Number(process.env.PG_POOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS || 10000),
});

module.exports = { pool };
