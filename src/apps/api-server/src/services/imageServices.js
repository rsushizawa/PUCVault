const { pool } = require('../config/database');
const { uploadToCloudinary } = require('../utils/cloudinaryUtil');

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
  async uploadImage(visualidentity_id, location, file) {
    let connect;
    const cfImageId = await uploadToCloudinary(file);
    try {
      connect = await pool.connect();
      console.log('conexão sucedida uploadImage');

      await pool.query('CALL publico.atualizar_identidade_visual( $1, $2, $3 )', [visualidentity_id, location, cfImageId]);

    } catch (error) {
      errorMsg(error);
    } finally {
      connect.release();
    }
  }
};






