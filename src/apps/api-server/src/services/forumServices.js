const express = require('express');
const cors = require('cors');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
const { error, log } = require('console');
const saltRounds = 10;
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
    let client;
    try {
      client = await pool.connect();
      console.log('conexão sucedida printForums');
      const res = await pool.query('SELECT * FROM publico.listar_foruns()');

      return res;
    } catch (error) {
      errorMsg(error);
    } finally {
      client.release();
    }
  },

  async listForumFiles(forum_id, page_num) {
    let client;
    try {
      client = await pool.connect();
      console.log('conexão sucedida listForumFiles');
      const res = await pool.query('SELECT * FROM publico.listar_arquivos_forum( $1, $2 )', [forum_id, page_num]);

      return res;
    } catch (error) {
      errorMsg(error);
    } finally {
      client.release();
    }
  },


  async searchForums(name) {
    let connect;
    try {
      connect = await pool.connect();
      console.log('conexão sucedida searchForums');

      let returnvalue = await pool.query('SELECT * FROM publico.buscar_forum_por_nome( $1 )', [name]);
      if (returnvalue.rows[0] === 0) {
        return null;
      }
      return returnvalue;
    } catch (error) {
      errorMsg(error);
    } finally {
      connect.release();
    }

  },


  async createForum(name, description, user_id) {
    let connect;
    try {
      connect = await pool.connect();
      console.log('conexão sucedida createForum');

      await pool.query('CALL publico.inserir_forum( $1, $2, $3)', [name, description, user_id]);

    } catch (error) {
      errorMsg(error);
    } finally {
      connect.release();
    }

  },

  async updateForumDescription(forum_id, user_id, newDescription) {
    let connect;
    try {
      connect = await pool.connect();
      console.log('conexão sucedida updateForumDescription');

      await pool.query('CALL publico.atualizar_descricao_forum( $1, $2, $3 )', [forum_id, user_id, newDescription]);

    } catch (error) {
      errorMsg(error);
    } finally {
      connect.release();
    }

  },

  async validateForum(forum_id, validator_id, forumState) {
    let connect;
    try {
      connect = await pool.connect();
      console.log('conexão sucedida validateForum');

      await pool.query('CALL publico.validar_forum($1,$2,$3)', [forum_id, validator_id, forumState]);

    } catch (error) {
      errorMsg(error);
    } finally {
      connect.release();
    }

  },

  async listForumFollowers(forum_id) {
    let connect;
    try {
      connect = await pool.connect();
      console.log('conexão sucedida validateForum');

      const res = await pool.query('SELECT * FROM publico.listar_seguidores_forum( $1 )', [forum_id]);

      console.table(res.rows);
    } catch (error) {
      errorMsg(error);
    } finally {
      connect.release();
    }


  },

  async toggleFollowForum(user_id, forum_id) {
    let client;
    try {
      client = await pool.connect();
      console.log('conexão sucedida toggleFollowForum');

      await pool.query('CALL publico.alternar_seguir_forum($1,$2)', [user_id, forum_id]);

    } catch (error) {
      errorMsg(error);
    } finally {
      client.release();
    }

  },


};
