const express = require('express');
const cors = require('cors');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
const { error } = require('console');
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



  async searchLogins(username, email) {
    let client;
    try {
      client = await pool.connect();
      console.log('conexão sucedida searchLogins');
      let returnvalue = await pool.query('SELECT * FROM publico.dados_login_usuario( $1, $2 )', [email, username]);
      if (returnvalue.rowCount === 0) {
        return false;
      }
      else {
        return true;
      }
    } catch (error) {
      errorMsg(error);

    }
  },

  async validateLoginCredentials(userEmail, password) {
    let client;
    try {
      client = await pool.connect();
      console.log('conexão sucedida validateLoginCredentials');
      let returnvalue = await pool.query('SELECT * FROM publico.dados_login_usuario( $1, $2 )', [userEmail, null]);
      if (returnvalue.rowCount === 0) {
        returnvalue = await pool.query('SELECT * FROM publico.dados_login_usuario( $1, $2 )', [null, userEmail]);
      }
      if (returnvalue.rowCount === 0) {
        console.log('user not found');
        return {
          authenticated: false,
          message: 'user or email not found'
        };
      }
      const userRow = returnvalue.rows[0];
      const passwordValid = await bcrypt.compare(password, userRow.senha_hash);

      if (passwordValid) {
        delete userRow.senha_hash;
        console.log('login successful');
        return {
          authenticated: true,
          user: userRow
        };
      } else {
        console.log('login failed');
        return {
          authenticated: false,
          message: 'incorrect password'
        };
      }
    } catch (error) {
      errorMsg(error);
    }
  },

  async addLogin(name, username, email, hashedPassword) {
    let client;
    try {
      client = await pool.connect();
      console.log('conexão bem sucedida addLogin');
      const queryText = 'CALL publico.inserir_usuario( $1, $2, $3, $4 )';
      const values = [name, username, email, hashedPassword];
      await pool.query(queryText, values);
      console.log('usuario inserido');

    } catch (error) {
      errorMsg(error);
    }
  },

  async printLogins() {
    let client;
    try {
      client = await pool.connect();
      console.log('conexão bem sucedida printLogins');
      const res = await pool.query('SELECT * FROM publico.listar_usuarios()');

      console.table(res.rows);
    } catch (error) {
      errorMsg(error);
    }
  },

  async findIDByUsername(username) {
    let client;
    try {
      client = await pool.connect();
      console.log('conexão sucedida findIDByUsername');
      let returnvalue = await pool.query('SELECT * FROM publico.buscar_usuario_por_nome_usuario( $1 )', [username]);
      if (!returnvalue.rows || returnvalue.rows.length === 0) {
        console.log('user not found');
        return null;
      }
      return returnvalue.rows[0].id;
    } catch (error) {
      errorMsg(error);
      return null;
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
    }
  }



};

