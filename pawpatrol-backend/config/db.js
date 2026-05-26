const mysql = require("mysql2/promise");
require("dotenv").config();

let pool;

const getPool = async () => {
  if (!pool) {
    pool = await mysql.createPool(process.env.DATABASE_URL);
    console.log("✅  Connected to MySQL");
  }
  return pool;
};

module.exports = { getPool };
