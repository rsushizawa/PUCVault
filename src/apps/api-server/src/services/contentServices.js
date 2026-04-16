const express = require('express');
const cors = require('cors');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
const { error, log } = require('console');
const { report } = require('process');
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
  async deleteContent(content_id, executor_id) {
    let connect;
    try {
      connect = await pool.connect();
      console.log('conexão sucedida deleteContent');

      await pool.query('CALL publico.deletar_conteudo($1, $2)', [content_id, executor_id]);

    } catch (error) {
      errorMsg(error);
    }
  },

  async reviewContent(user_id, content_id, review) {
    let connect;
    try {
      connect = await pool.connect();
      console.log('conexão sucedida reviewContent');

      await pool.query('CALL publico.avaliar_conteudo($1, $2, $3)', [user_id, content_id, review]);

    } catch (error) {
      errorMsg(error);
    }
  },

  async reportContent(type, user_id, content_id) {
    let connect;
    try {
      connect = await pool.connect();
      console.log('conexão sucedida reportContent');

      await pool.query('CALL publico.inserir_denuncia_conteudo($1, $2, $3)', [type, user_id, content_id]);

    } catch (error) {
      errorMsg(error);
    }
  },

  async resolveReport(report_id, executor_id, reportState) {
    let connect;
    try {
      connect = await pool.connect();
      console.log('conexão sucedida resolveReport');

      await pool.query('CALL publico.resovler_denuncia($1, $2, $3)', [report_id, executor_id, reportState]);

    } catch (error) {
      errorMsg(error);
    }
  }
};



