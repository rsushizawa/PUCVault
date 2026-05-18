const { pool } = require("../config/database");
const { error, log } = require("console");
const bcrypt = require("bcryptjs");

function errorMsg(error) {
  console.error("--- DETALHES DO ERRO ---");
  console.error("Mensagem:", error.message);
  console.error("Código Postgre:", error.code); // Ex: 23505 (duplicado), 42P01 (tabela não existe)
  console.error("Detalhe:", error.detail);
  console.error("Onde:", error.where);
  console.error("------------------------");
  throw error;
}

module.exports = {
  async searchLogins(username, email) {
    let client;
    try {
      client = await pool.connect();
      console.log("conexão sucedida searchLogins");
      let returnvalue = await pool.query(
        "SELECT * FROM publico.dados_login_usuario( $1, $2 )",
        [email, username],
      );
      if (returnvalue.rowCount === 0) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      errorMsg(error);
    } finally {
      client.release();
    }
  },

  async validateLoginCredentials(userEmail, password) {
    let client;
    try {
      client = await pool.connect();
      console.log("conexão sucedida validateLoginCredentials");
      let returnvalue = await pool.query(
        "SELECT * FROM publico.dados_login_usuario( $1, $2 )",
        [userEmail, null],
      );
      if (returnvalue.rowCount === 0) {
        returnvalue = await pool.query(
          "SELECT * FROM publico.dados_login_usuario( $1, $2 )",
          [null, userEmail],
        );
      }
      if (returnvalue.rowCount === 0) {
        console.log("user not found");
        return {
          authenticated: false,
          message: "user or email not found",
        };
      }
      const userRow = returnvalue.rows[0];
      const passwordValid = await bcrypt.compare(password, userRow.senha_hash);

      if (passwordValid) {
        delete userRow.senha_hash;
        console.log("login successful");
        return {
          authenticated: true,
          user: userRow,
        };
      } else {
        console.log("login failed");
        return {
          authenticated: false,
          message: "incorrect password",
        };
      }
    } catch (error) {
      errorMsg(error);
    } finally {
      client.release();
    }
  },

  async deleteUser(user_id) {
    let client;
    try {
      client = await pool.connect();
      console.log("conexão sucedida deleteUser");
      await pool.query("SELECT * FROM publico.deletar_usuario( $1 )", [
        user_id,
      ]);
    } catch (error) {
      errorMsg(error);
    } finally {
      client.release();
    }
  },

  async addLogin(name, username, email, hashedPassword) {
    let client;
    try {
      client = await pool.connect();
      console.log("conexão bem sucedida addLogin");
      const queryText = "CALL publico.inserir_usuario( $1, $2, $3, $4 )";
      const values = [name, username, email, hashedPassword];
      await pool.query(queryText, values);
      console.log("usuario inserido");
    } catch (error) {
      errorMsg(error);
    } finally {
      client.release();
    }
  },

  async getUserInfo(user_id) {
    let client;
    try {
      client = await pool.connect();
      console.log("conexão sucedida getUserInfo");

      const res = await pool.query(
        "SELECT * FROM publico.buscar_usuario_por_id($1)",
        [user_id],
      );
      return res;
    } catch (error) {
      errorMsg(error);
    } finally {
      client.release();
    }
  },

  async printLogins() {
    let client;
    try {
      client = await pool.connect();
      console.log("conexão bem sucedida printLogins");
      const res = await pool.query("SELECT * FROM publico.listar_usuarios()");
      return res;
    } catch (error) {
      errorMsg(error);
    } finally {
      client.release();
    }
  },

  async findIDByUsername(username) {
    let client;
    try {
      client = await pool.connect();
      console.log("conexão sucedida findIDByUsername");
      let returnvalue = await pool.query(
        "SELECT * FROM publico.buscar_usuario_por_nome_usuario( $1 )",
        [username],
      );
      if (!returnvalue.rows || returnvalue.rows.length === 0) {
        console.log("user not found");
        return null;
      }
      return returnvalue.rows[0].id;
    } catch (error) {
      errorMsg(error);
      return null;
    } finally {
      client.release();
    }
  },

  async toggleUserStatus(user_id) {
    let client;
    try {
      client = await pool.connect();
      console.log("conexão sucedida alternateUserStatus");

      await pool.query("CALL publico.alternar_status_usuario( $1 )", [user_id]);
    } catch (error) {
      errorMsg(error);
    } finally {
      client.release();
    }
  },

  async changeUserRole(executor_id, target_id, newRole) {
    let client;
    try {
      client = await pool.connect();
      console.log("conexão sucedida changeUserRole");

      await pool.query("CALL publico.alterar_cargo_usuario($1,$2,$3)", [
        executor_id,
        target_id,
        newRole,
      ]);
    } catch (error) {
      errorMsg(error);
    } finally {
      client.release();
    }
  },

  async reportUser(type, reportee_id, reported_id) {
    let client;
    try {
      client = await pool.connect();
      console.log("conexão sucedida reportUser");

      await pool.query("CALL publico.inserir_denuncia_usuario($1,$2,$3)", [
        type,
        reportee_id,
        reported_id,
      ]);
    } catch (error) {
      errorMsg(error);
    } finally {
      client.release();
    }
  },

  async toggleFollowUser(follower_id, following_id) {
    let client;
    try {
      client = await pool.connect();
      console.log("conexão sucedida toggleFollowUser");

      await pool.query("CALL publico.alternar_seguir_usuario($1,$2)", [
        follower_id,
        following_id,
      ]);
    } catch (error) {
      errorMsg(error);
    } finally {
      client.release();
    }
  },

  async changeDescription(user_id, new_description) {
    let client;
    try {
      client = await pool.connect();
      console.log("conexão sucedida changeDescription");

      await pool.query("CALL publico.atualizar_descricao_usuario( $1, $2)", [
        user_id,
        new_description,
      ]);
    } catch (error) {
      errorMsg(error);
    } finally {
      client.release();
    }
  },

  async getUserByUsername(username) {
    let client;
    try {
      client = await pool.connect();
      console.log("conexão sucedida getUserByUsername");
      const res = await pool.query(
        "SELECT * FROM publico.buscar_usuario_por_nome_usuario($1)",
        [username],
      );
      if (!res.rows || res.rows.length === 0) return null;
      const user = { ...res.rows[0] };
      delete user.senha_hash;
      return user;
    } catch (error) {
      errorMsg(error);
    } finally {
      if (client) client.release();
    }
  },

  async checkForumFollow(user_id, forum_id) {
    let client;
    try {
      client = await pool.connect();
      console.log("conexão sucedida checkForumFollow");
      const res = await pool.query(
        "SELECT * FROM publico.checar_se_usuario_segue_forum($1, $2)",
        [user_id, forum_id],
      );
      if (!res.rows || res.rows.length === 0) return { follows: false };
      return { follows: !!res.rows[0].segue };
    } catch (error) {
      errorMsg(error);
    } finally {
      if (client) client.release();
    }
  },
};

