const { Pool } = require('pg');

const path = require('path');
const envPath = path.resolve(__dirname, '../../src/.env');

require('dotenv').config({ path: envPath });
const hostAccess = process.env.DB_HOST;
const userAccess = process.env.DB_USER;
const passAccess = process.env.DB_PASS;
const portAccess = process.env.DB_PORT;
const databaseAcess = process.env.DB_NAME;



const pool = new Pool({
  host: hostAccess,
  port: portAccess,
  database: databaseAcess,
  user: userAccess,
  password: passAccess,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = { pool };
