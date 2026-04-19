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
  async getUserTags(creator_id) {
    let connect;

    try {
      connect = await pool.connect();
      console.log('conexão sucedida printTags');

      const res = await pool.query('SELECT * FROM publico.buscar_tags_por_criador( $1 )', [creator_id]);

      return res;

    } catch (error) {
      errorMsg(error);
    } finally {
      connect.release();
    }


  },

  async createTag(tagName, creator_id) {
    let connect;

    try {
      connect = pool.connect();
      console.log('conexão sucedida createTag');

      await pool.query('CALL publico.inserir_tag($1,$2)', [tagName, creator_id]);
    } catch (error) {
      errorMsg(error);
    } finally {
      connect.release();
    }

  },

  async validateTag(tag_id, validator_id, tagState) {
    let connect;

    try {
      connect = pool.connect();
      console.log('conexão sucedida validateTag');

      await pool.query('CALL publico.validar_tag($1,$2,$3)', [tag_id, validator_id, tagState]);
    } catch (error) {
      errorMsg(error);
    } finally {
      connect.release();
    }

  }
};


