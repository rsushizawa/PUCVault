const db = require("../config/database");
const path = require("path");

function errorMsg(error) {
  console.error("--- DETALHES DO ERRO ---");
  console.error("Mensagem:", error.message);
  console.error("Código Postgre:", error.code);
  console.error("Detalhe:", error.detail);
  console.error("Onde:", error.where);
  console.error("------------------------");
  throw error;
}

module.exports = {
  async denunciarUsuario(tipo, denunciante_id, denunciado_id) {
    try {
      console.log("conexão sucedida denunciarUsuario");
      await db.query("CALL publico.inserir_denuncia_usuario($1, $2, $3)", [
        tipo,
        denunciante_id,
        denunciado_id,
      ]);
    } catch (error) {
      errorMsg(error);
    }
  },

  async denunciarConteudo(tipo, denunciante_id, conteudo_id) {
    try {
      console.log("conexão sucedida denunciarConteudo");
      await db.query("CALL publico.inserir_denuncia_conteudo($1, $2, $3)", [
        tipo,
        denunciante_id,
        conteudo_id,
      ]);
    } catch (error) {
      errorMsg(error);
    }
  },

  async resolverDenuncia(
    denuncia_id,
    executor_id,
    novo_status,
    punicao = null,
    tempo_silencio = null,
  ) {
    try {
      console.log("conexão sucedida resolverDenuncia");
      await db.query("CALL publico.resolver_denuncia($1, $2, $3, $4, $5)", [
        denuncia_id,
        executor_id,
        novo_status,
        punicao,
        tempo_silencio,
      ]);
    } catch (error) {
      errorMsg(error);
    }
  },

  async listarDenunciasAbertas() {
    try {
      console.log("conexão sucedida listarDenunciasAbertas");
      const res = await db.query("SELECT * FROM publico.listar_denuncias()");
      return res;
    } catch (error) {
      errorMsg(error);
    }
  },

  async listarUsuariosDenunciados(status) {
    try {
      console.log("conexão sucedida listarUsuariosDenunciados");
      const res = await db.query(
        "SELECT * FROM publico.listar_denuncias_usuario($1)",
        [status],
      );
      return res;
    } catch (error) {
      errorMsg(error);
    }
  },
  async listarPostagemDenunciados(status) {
    try {
      console.log("conexão sucedida listarUsuariosDenunciados");
      const res = await db.query(
        "SELECT * FROM publico.listar_denuncias_postagem($1)",
        [status],
      );
      return res;
    } catch (error) {
      errorMsg(error);
    }
  },

  async listarComentariosDenunciados(status) {
    try {
      console.log("conexão sucedida listarUsuariosDenunciados");
      const res = await db.query(
        "SELECT * FROM publico.listar_denuncias_comentario($1)",
        [status],
      );
      return res;
    } catch (error) {
      errorMsg(error);
    }
  },
};
