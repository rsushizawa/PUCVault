const db = require('../config/database');
const { error, log } = require('console');
const bcrypt = require('bcryptjs');


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
    try {
      console.log('conexão sucedida searchLogins');
      let returnvalue = await db.query('SELECT * FROM publico.dados_login_usuario( $1, $2, $3 )', [null, email, username]);
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

  async getHashById(user_id) {
    try {
      console.log('conexão sucedida deleteUser');
      const returnvalue = await db.query('SELECT * FROM publico.dados_login_usuario( $1, $2, $3 )', [user_id, null, null]);
      return returnvalue.rows[0];
    } catch (error) {
      errorMsg(error);
    }
  },


  async validateLoginCredentials(userEmail, password) {
    try {
      console.log('conexão sucedida validateLoginCredentials');
      let returnvalue = await db.query('SELECT * FROM publico.dados_login_usuario( $1, $2 , $3)', [null, userEmail, null]);
      if (returnvalue.rowCount === 0) {
        returnvalue = await db.query('SELECT * FROM publico.dados_login_usuario( $1, $2, $3 )', [null, null, userEmail]);
      }
      if (returnvalue.rowCount === 0) {
        console.log('user not found');
        return {
          authenticated: false,
          message: 'user or email not found'
        };
      }
      console.log(returnvalue);
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

  async deleteUser(user_id) {
    try {
      console.log('conexão sucedida deleteUser');
      await db.query('SELECT * FROM publico.deletar_usuario( $1 )', [user_id]);
    } catch (error) {
      errorMsg(error);
    }
  },

  async addLogin(name, username, email, hashedPassword) {
    try {
      console.log('conexão bem sucedida addLogin');
      const queryText = 'CALL publico.inserir_usuario( $1, $2, $3, $4 )';
      const values = [name, username, email, hashedPassword];
      await db.query(queryText, values);
      console.log('usuario inserido');

    } catch (error) {
      errorMsg(error);
    }

  },

  async getUserInfo(user_id, logged_id) {
    try {
      console.log('conexão sucedida getUserInfo');

      const res = await db.query('SELECT * FROM publico.buscar_usuario_por_id($1, $2)', [user_id, logged_id]);
      return res;

    } catch (error) {
      errorMsg(error);
    }
  },

  async getUserInfoByEmail(email) {
    try {
      console.log('conexão sucedida getUserInfoByEmail');

      const res = await db.query('SELECT * FROM publico.buscar_usuario_por_email($1)', [email]);
      return res;

    } catch (error) {
      errorMsg(error);
    }

  },

  async printLogins() {
    try {
      console.log('conexão bem sucedida printLogins');
      const res = await db.query('SELECT * FROM publico.listar_usuarios()');
      return res;
    } catch (error) {
      errorMsg(error);
    }
  },

  async findIDByUsername(username) {
    try {
      console.log('conexão sucedida findIDByUsername');
      let returnvalue = await db.query('SELECT * FROM publico.buscar_usuario_por_nome_usuario( $1 )', [username]);
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

  async toggleUserStatus(user_id) {
    try {
      console.log('conexão sucedida alternateUserStatus');

      await db.query('CALL publico.alternar_status_usuario( $1 )', [user_id]);
    } catch (error) {
      errorMsg(error);
    }
  },

  async changeUserRole(executor_id, target_id, newRole) {
    try {
      console.log('conexão sucedida changeUserRole');

      await db.query('CALL publico.alterar_cargo_usuario($1,$2,$3)', [executor_id, target_id, newRole]);
    } catch (error) {
      errorMsg(error);
    }
  },

  async reportUser(type, reportee_id, reported_id) {
    try {
      console.log('conexão sucedida reportUser');

      await db.query('CALL publico.inserir_denuncia_usuario($1,$2,$3)', [type, reportee_id, reported_id]);
    } catch (error) {
      errorMsg(error);
    }
  },

  async toggleFollowUser(follower_id, following_id) {
    try {
      console.log('conexão sucedida toggleFollowUser');

      await db.query('CALL publico.alternar_seguir_usuario($1,$2)', [follower_id, following_id]);
    } catch (error) {
      errorMsg(error);
    }
  },

  async changeDescription(user_id, new_description) {
    try {
      console.log('conexão sucedida changeDescription');

      await db.query('CALL publico.atualizar_descricao_usuario( $1, $2 )', [user_id, new_description]);
    } catch (error) {
      errorMsg(error);
    }
  },

  async changePassword(user_id, new_hash) {
    try {
      console.log('conexão sucedida changePassword');

      await db.query('CALL publico.atualizar_senha_usuario( $1, $2 )', [user_id, new_hash]);
    } catch (error) {
      errorMsg(error);
    }
  },

  async changeUsername(user_id, new_name) {
    try {
      console.log('conexão sucedida changePassword');

      await db.query('CALL publico.atualizar_nome_usuario( $1, $2 )', [user_id, new_name]);
    } catch (error) {
      errorMsg(error);
    }
  },

  async toggle2FA(user_id) {
    try {
      console.log('conexão sucedida toggle2FA');

      await db.query('CALL publico.alternar_a2f ($1)', [user_id]);
    } catch (error) {

    }
  }

};

