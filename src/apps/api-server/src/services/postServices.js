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
  async createPost(title, content, creator_id, forum_id, file_name, file_id, tag_id_array) {
    try {
      console.log('conexão sucedida createPost');

      await db.query('CALL publico.inserir_postagem($1, $2, $3, $4, $5, $6, $7)', [title, content, creator_id, forum_id, file_name, file_id, tag_id_array]);

    } catch (error) {
      errorMsg(error);
    }
  },

  async getSinglePost(forum_id) {
    try {
      console.log('conexão sucedida getSinglePost');

      const res = await db.query('SELECT * FROM publico.buscar_postagem( $1 )', [forum_id]);

      return res.rows
    } catch (error) {
      errorMsg(error);
    }
  },




  async getPost(forum_id, page_num) {
    try {
      console.log('conexão sucedida getPost');

      const res = await db.query('SELECT * FROM publico.listar_postagens_forum($1::int, $2::int)', [forum_id, page_num]);

      return res.rows;

    } catch (error) {
      errorMsg(error);
    }
  },

  async getUserPosts(user_id, page_num) {
    try {
      log('conexão sucedida getUserPosts');

      const res = await db.query('SELECT * FROM publico.listar_postagens_usuario( $1, $2 )', [user_id, page_num]);

      return res.rows;
    } catch (error) {
      errorMsg(error);
    }
  },
  async createComment(content, creator_id, father_content_id) {
    try {
      console.log('conexão sucedida createComment');

      await db.query('CALL publico.inserir_comentario($1, $2, $3)', [content, creator_id, father_content_id]);

    } catch (error) {
      errorMsg(error);
    }
  },

  async listComments(post_id) {
    try {
      console.log('conexão sucedida listComments');

      const res = await db.query('SELECT * FROM publico.listar_comentarios_postagem( $1 )', [post_id]);

      return res;
    } catch (error) {
      errorMsg(error);
    }
  },
  async toggleUpvoteContent(user_id, content_id) {
    try {
      console.log('conexão sucedida rateContent');

      await db.query('CALL publico.avaliar_conteudo( $1, $2, $3 )', [user_id, content_id, 1]);

    } catch (error) {
      errorMsg(error);
    }
  },
  async toggleDownvoteContent(user_id, content_id) {
    try {
      console.log('conexão sucedida rateContent');

      await db.query('CALL publico.avaliar_conteudo( $1, $2, $3 )', [user_id, content_id, -1]);

    } catch (error) {
      errorMsg(error);
    }
  }
};

