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
  async getUserTags(creator_id) {
    try {
      console.log('conexão sucedida printTags');

      const res = await db.query('SELECT * FROM publico.buscar_tags_por_criador( $1 )', [creator_id]);

      return res;

    } catch (error) {
      errorMsg(error);
    }
  },

  async listTags() {
    try {
      console.log('conexão sucedida listTags');

      const res = await db.query('SELECT * FROM pulbico.listar_tags()');
      return res;

    } catch (error) {
      errorMsg(error);
    }
  },

  async findTags(find) {
    try {
      console.log('conexão sucedida findTags');
      const res = await db.query('SELECT * FROM publico.buscar_tags_relevantes($1)', [find]);
      return res;
    } catch (error) {
      errorMsg(error);
    }
  },

  async createTag(tagName, creator_id) {

    try {
      console.log('conexão sucedida createTag');
      await db.query('CALL publico.inserir_tag($1,$2)', [tagName, creator_id]);
    } catch (error) {
      errorMsg(error);
    }
  },

  async validateTag(tag_id, validator_id, tagState) {
    try {
      console.log('conexão sucedida validateTag');
      await db.query('CALL publico.validar_tag($1,$2,$3)', [tag_id, validator_id, tagState]);
    } catch (error) {
      errorMsg(error);
    }
  }
};


