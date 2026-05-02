const { pool } = require('../config/database');
const path = require('path');
const envPath = path.resolve(__dirname, '../../src/.env');

require('dotenv').config({ path: envPath });
const hostAccess = process.env.DB_HOST;
const userAccess = process.env.DB_USER;
const passAccess = process.env.DB_PASS;
const portAccess = process.env.DB_PORT;
const databaseAcess = process.env.DB_NAME;


function errorMsg(error) {
  console.error('--- DETALHES DO ERRO ---');
  console.error('Mensagem:', error.message);
  console.error('Código Postgre:', error.code); // Ex: 23505 (duplicado), 42P01 (tabela não existe)
  console.error('Detalhe:', error.detail);
  console.error('Onde:', error.where);
  console.error('------------------------');
  throw error;

};

module.exports = {
  async printFeed(user_id, page_num) {
    let client;
    try {
      client = await pool.connect();
      console.log('conexão sucedida printFeed');
      let res = await pool.query('SELECT * FROM publico.listar_postagens_feed($1, $2)', [user_id, page_num]);
      return res;
    } catch (error) {
      errorMsg(error);
    } finally {
      client.release();
    }
  }
}
