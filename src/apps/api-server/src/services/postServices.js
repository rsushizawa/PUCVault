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
  async createPost(title, content, creator_id, forum_id, file_id, tag_id_array) {
    let connect;
    try {
      connect = await pool.connect();
      console.log('conexão sucedida createPost');

      await pool.query('CALL publico.inserir_postagem($1, $2, $3, $4, $5, $6)', [title, content, creator_id, forum_id, file_id, tag_id_array]);

    } catch (error) {
      errorMsg(error);
    } finally {
      connect.release();
    }
  },

  async getSinglePost(forum_id) {
    let connect;

    try {
      connect = await pool.connect();
      console.log('conexão sucedida getSinglePost');

      const res = await pool.query('SELECT * FROM publico.buscar_postagem( $1 )', [forum_id]);
    } catch (error) {
      errorMsg(error);
    } finally {
      connect.release();
    }
  },




  async getPost(forum_id, page_num) {
    let connect;
    try {
      connect = await pool.connect();
      console.log('conexão sucedida getPost');

      const res = await pool.query('SELECT * FROM publico.listar_postagens_forum($1::int, $2::int)', [forum_id, page_num]);

      return res.rows;

    } catch (error) {
      console.error("Erro no Banco:", error.message);
      errorMsg(error);
    } finally {
      connect.release();
    }
  }
};

