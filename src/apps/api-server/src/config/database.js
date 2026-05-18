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
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err, client) => {
  console.error('Erro inesperado no cliente do banco de dados', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),

  getClient: () => pool.connect(),

  pool: pool
};
