const db = require('../config/database');
const path = require('path');

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
    try {
      console.log('conexão sucedida printFeed');
      let res = await db.query('SELECT * FROM publico.listar_postagens_feed($1, $2)', [user_id, page_num]);
      return res;
    } catch (error) {
      errorMsg(error);
    }
  }
}
