const db = require('../config/database');
const { error, log } = require('console');

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
  async deleteContent(content_id, executor_id) {
    try {
      console.log('conexão sucedida deleteContent');

      await db.query('CALL publico.deletar_conteudo($1, $2)', [content_id, executor_id]);

    } catch (error) {
      errorMsg(error);
    }
  },

  async reviewContent(user_id, content_id, review) {
    try {
      console.log('conexão sucedida reviewContent');

      await db.query('CALL publico.avaliar_conteudo($1, $2, $3)', [user_id, content_id, review]);

    } catch (error) {
      errorMsg(error);
    }
  },

  async reportContent(type, user_id, content_id) {
    try {
      console.log('conexão sucedida reportContent');

      await db.query('CALL publico.inserir_denuncia_conteudo($1, $2, $3)', [type, user_id, content_id]);

    } catch (error) {
      errorMsg(error);
    }
  },

  async resolveReport(report_id, executor_id, reportState) {
    try {
      console.log('conexão sucedida resolveReport');

      await db.query('CALL publico.resolver_denuncia($1, $2, $3)', [report_id, executor_id, reportState]);

    } catch (error) {
      errorMsg(error);
    }
  }
};
