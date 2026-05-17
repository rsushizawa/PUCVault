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

  async printForums() {
    try {
      console.log('conexão sucedida printForums');
      const res = await db.query('SELECT * FROM publico.listar_foruns()');

      return res;
    } catch (error) {
      errorMsg(error);
    }
  },

  async listForumFiles(forum_id, page_num) {
    try {
      console.log('conexão sucedida listForumFiles');
      const res = await db.query('SELECT * FROM publico.listar_arquivos_forum( $1, $2 )', [forum_id, page_num]);

      return res;
    } catch (error) {
      errorMsg(error);
    }
  },

  async checkUserForum(user_id, forum_id) {
    try {
      console.log('conexão sucedida checkUserForum');
      const res = await db.query('SELECT * FROM publico.checar_se_usuario_segue_forum($1, $2)', [user_id, forum_id]);
      return res;

    } catch (error) {
      errorMsg(error);
    }
  },

  async listTagsFilesYear(forum_id, year) {
    try {
      console.log('conexão sucedida listTagsFilesYear');
      const res = await db.query('SELECT * FROM publico.listar_tags_arquivo_por_ano( $1, $2 )', [forum_id, year]);
      return res.rows;
    } catch (error) {
      errorMsg(error);
    }
  },

  async listForumFilesYear(forum_id) {
    try {
      console.log('conexão sucedida listForumFilesYear');
      const res = await db.query('SELECT * FROM publico.listar_anos_com_arquivo( $1 )', [forum_id]);
      return res.rows;
    } catch (error) {
      errorMsg(error);
    }
  },

  async searchForums(name) {
    try {
      console.log('conexão sucedida searchForums');
      let returnvalue = await db.query('SELECT * FROM publico.buscar_forum_por_nome( $1 )', [name]);
      if (returnvalue.rows[0] === 0) {
        return null;
      }
      return returnvalue;
    } catch (error) {
      errorMsg(error);
    }
  },


  async createForum(name, description, user_id) {
    try {
      console.log('conexão sucedida createForum');
      await db.query('CALL publico.inserir_forum( $1, $2, $3)', [name, description, user_id]);
    } catch (error) {
      errorMsg(error);
    }
  },

  async updateForumDescription(forum_id, user_id, newDescription) {
    try {
      console.log('conexão sucedida updateForumDescription');
      await db.query('CALL publico.atualizar_descricao_forum( $1, $2, $3 )', [forum_id, user_id, newDescription]);
    } catch (error) {
      errorMsg(error);
    }
  },

  async validateForum(forum_id, validator_id, forumState) {
    try {
      console.log('conexão sucedida validateForum');
      await db.query('CALL publico.validar_forum($1,$2,$3)', [forum_id, validator_id, forumState]);
    } catch (error) {
      errorMsg(error);
    }
  },

  async listForumFollowers(forum_id) {
    try {
      console.log('conexão sucedida validateForum');
      const res = await db.query('SELECT * FROM publico.listar_seguidores_forum( $1 )', [forum_id]);
      return res;
    } catch (error) {
      errorMsg(error);
    }
  },

  async toggleFollowForum(user_id, forum_id) {
    try {
      console.log('conexão sucedida toggleFollowForum');
      await db.query('CALL publico.alternar_seguir_forum($1,$2)', [user_id, forum_id]);
    } catch (error) {
      errorMsg(error);
    }
  },

  async getSingleForum(forum_id) {
    try {
      console.log('conexão sucedida getSingleForum');
      const res = await db.query('SELECT * FROM publico.buscar_forum_por_id ( $1 )', [forum_id]);
      return res;
    } catch (error) {
      errorMsg(error);
    }
  }

};
