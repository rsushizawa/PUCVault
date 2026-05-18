const { pool } = require('../config/database');
const path = require('path');
const envPath = path.resolve(__dirname, '../../src/.env');

function errorMsg(error) {
  console.error('--- DETALHES DO ERRO ---');
  console.error('Mensagem:', error.message);
  console.error('Código Postgre:', error.code);
  console.error('Detalhe:', error.detail);
  console.error('Onde:', error.where);
  console.error('------------------------');
  throw error;
}

module.exports = {
  /**
   * Denuncia um usuário.
   * Chama: CALL publico.inserir_denuncia_usuario(<tipo>, <denunciante_id>, <denunciado_id>)
   */
  async denunciarUsuario(tipo, denunciante_id, denunciado_id) {
    let connect;
    try {
      connect = await pool.connect();
      console.log('conexão sucedida denunciarUsuario');
      await pool.query(
        'CALL publico.inserir_denuncia_usuario($1, $2, $3)',
        [tipo, denunciante_id, denunciado_id]
      );
    } catch (error) {
      errorMsg(error);
    } finally {
      if (connect) connect.release();
    }
  },

  /**
   * Denuncia um conteúdo (post ou comentário).
   * Chama: CALL publico.inserir_denuncia_conteudo(<tipo>, <denunciante_id>, <conteudo_id>)
   */
  async denunciarConteudo(tipo, denunciante_id, conteudo_id) {
    let connect;
    try {
      connect = await pool.connect();
      console.log('conexão sucedida denunciarConteudo');
      await pool.query(
        'CALL publico.inserir_denuncia_conteudo($1, $2, $3)',
        [tipo, denunciante_id, conteudo_id]
      );
    } catch (error) {
      errorMsg(error);
    } finally {
      if (connect) connect.release();
    }
  },

  /**
   * Resolve ou ignora uma denúncia (apenas ADMIN/SUPERADMIN).
   * Chama: CALL publico.resolver_denuncia(<denuncia_id>, <executor_id>, <novo_status>)
   */
  async resolverDenuncia(denuncia_id, executor_id, novo_status) {
    let connect;
    try {
      connect = await pool.connect();
      console.log('conexão sucedida resolverDenuncia');
      await pool.query(
        'CALL publico.resolver_denuncia($1, $2, $3)',
        [denuncia_id, executor_id, novo_status]
      );
    } catch (error) {
      errorMsg(error);
    } finally {
      if (connect) connect.release();
    }
  },

  /**
   * Lista denúncias abertas (apenas ADMIN/SUPERADMIN).
   * Retorna denúncias com status ABERTA, ordenadas por data de criação.
   */
  async listarDenunciasAbertas() {
    let connect;
    try {
      connect = await pool.connect();
      console.log('conexão sucedida listarDenunciasAbertas');
      const res = await pool.query(`
        SELECT
          d.id,
          d.tipo,
          d.status,
          d.criado_em,
          u.nome_usuario AS denunciante,
          du.usuario_denunciado,
          dc.conteudo_denunciado
        FROM privado.denuncia d
        JOIN privado.usuario u ON u.id = d.denunciante
        LEFT JOIN privado.denuncia_usuario du ON du.id = d.id
        LEFT JOIN privado.denuncia_conteudo dc ON dc.id = d.id
        WHERE d.status = 'ABERTA'
        ORDER BY d.criado_em ASC
      `);
      return res;
    } catch (error) {
      errorMsg(error);
    } finally {
      if (connect) connect.release();
    }
  }
};

