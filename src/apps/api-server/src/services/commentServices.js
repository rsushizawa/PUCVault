const express = require('express');
const cors = require('cors');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const path = require('path');
const { error, log } = require('console');
const saltRounds = 10;

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
  async createComment(content, creator_id, father_content_id) {
    let connect;
    try {
      connect = await pool.connect();
      console.log('conexão sucedida createComment');

      await pool.query('CALL publico.inserir_comentario($1, $2, $3)', [content, creator_id, father_content_id]);

    } catch (error) {
      errorMsg(error);
    } finally {
      connect.release();
    }

  },

  async listComments(post_id) {
    let connect;
    try {
      connect = await pool.connect();
      console.log('conexão sucedida listComments');

      const res = await pool.query('SELECT * FROM publico.listar_comentarios_postagem( $1 )', [post_id]);

      return res;
    } catch (error) {
      errorMsg(error);
    } finally {
      connect.release();
    }
  }
};


