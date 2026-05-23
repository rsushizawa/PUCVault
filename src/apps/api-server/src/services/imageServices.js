const db = require('../config/database');
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
  async uploadImage(visualidentity_id, location, file, context) {
    console.log('O que chegou como "file":', file);
    const cfImageId = await uploadToCloudinary(file, context);
    try {
      console.log('conexão sucedida uploadImage');

      //await db.query('CALL publico.atualizar_identidade_visual( $1, $2, $3 )', [visualidentity_id, location, cfImageId]);
      console.log(`\n--- ENVIANDO PARA A PROCEDURE ---`);
      console.log(`Param 1 (ID): ${visualidentity_id} | Tipo: ${typeof visualidentity_id}`);
      console.log(`Param 2 (Loc): ${location} | Tipo: ${typeof location}`);
      console.log(`Param 3 (URL): ${cfImageId}`);

      const pgResponse = await db.query('CALL publico.atualizar_identidade_visual( $1, $2, $3 )', [visualidentity_id, location, cfImageId]);

      // LOG CRÍTICO: Vamos ver o que o Postgres devolveu
      console.log('--- RESPOSTA DO POSTGRES ---');
      console.log('Comando:', pgResponse.command);
      console.log('Linhas afetadas (rowCount):', pgResponse.rowCount);
      console.log('----------------------------\n');
      return cfImageId;

    } catch (error) {
      errorMsg(error);
    }
  },
  async uploadImageForum(forum_id, user_id, location, file, context) {
    const cfImageId = await uploadToCloudinary(file, context);
    try {
      console.log('conexão sucedida uploadImage');

      const pgResponse = await db.query('CALL publico.atualizar_identidade_visual_forum( $1, $2, $3, $4 )', [forum_id, user_id, location, cfImageId]);

      // LOG CRÍTICO: Vamos ver o que o Postgres devolveu
      console.log('--- RESPOSTA DO POSTGRES ---');
      console.log('Comando:', pgResponse.command);
      console.log('Linhas afetadas (rowCount):', pgResponse.rowCount);
      console.log('----------------------------\n');
      return cfImageId;

    } catch (error) {
      errorMsg(error);
    }
  }
};






