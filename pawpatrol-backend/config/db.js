// config/db.js
// Handles the single shared mssql connection pool.
// Import { pool, sql } wherever you need to query the DB.

const sql = require("mssql");
require("dotenv").config();

const config = {
  server:   process.env.DB_SERVER   || "localhost",
  database: process.env.DB_NAME     || "PawPatrol",
  port:     parseInt(process.env.DB_PORT || "1433"),
  options: {
    encrypt:               false,   // set true if using Azure SQL
    trustServerCertificate: true,
    enableArithAbort:       true,
  },
};

// Windows Authentication (SSMS default) vs SQL Server Authentication
if (process.env.DB_TRUSTED_CONNECTION === "true") {
  config.options.trustedConnection = true; // Windows Auth
} else {
  config.user     = process.env.DB_USER;
  config.password = process.env.DB_PASSWORD;
}

// Singleton pool – created once on first import
let pool;

const getPool = async () => {
  if (!pool) {
    pool = await sql.connect(config);
    console.log("✅  Connected to SQL Server –", process.env.DB_NAME);
  }
  return pool;
};

module.exports = { getPool, sql };
