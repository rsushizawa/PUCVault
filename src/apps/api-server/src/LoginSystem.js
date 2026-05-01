const express = require('express');
const cors = require('cors');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
const { error } = require('console');

const envPath = path.resolve(__dirname, "../../../../.env");


let user_id;




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
  ssl: false
});

function errorMsg(error) {
  console.error('--- DETALHES DO ERRO ---');
  console.error('Mensagem:', error.message);
  console.error('Código Postgre:', error.code); // Ex: 23505 (duplicado), 42P01 (tabela não existe)
  console.error('Detalhe:', error.detail);
  console.error('Onde:', error.where);
  console.error('------------------------');
  throw error;

}

async function searchLogins(username, email) {
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
}


async function validateLoginCredentials(userEmail, password) {
  let client;
  try {
    client = await pool.connect();
    console.log('conexão sucedida validateLoginCredentials');
    let returnvalue = await pool.query('SELECT * FROM publico.dados_login_usuario( $1, $2 )', [userEmail, null]);
    if (returnvalue.rowCount === 0) {
      returnvalue = await pool.query('SELECT * FROM publico.dados_login_usuario( $1, $2 )', [null, userEmail]);
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
  }
}

async function addLogin(name, username, email, hashedPassword) {
  let client;
  try {
    client = await pool.connect();
    console.log('conexão bem sucedida addLogin');
    const queryText = 'CALL publico.inserir_usuario( $1, $2, $3, $4)';
    const values = [name, username, email, hashedPassword];
    await pool.query(queryText, values);
    console.log('usuario inserido');

  } catch (error) {
    errorMsg(error);
  }
}



async function printLogins() {
  let client;
  try {
    client = await pool.connect();
    console.log('conexão bem sucedida printLogins');
    const res = await pool.query('SELECT * FROM publico.listar_usuarios()');

    console.table(res.rows);
  } catch (error) {

    errorMsg(error);
  }
}

const saltRounds = 10;

let app = express();
app.use(cors());
app.use(express.json());



const signinSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email").max(50),
  name: z.string().min(3, "Nome(mínimo 3 caracteres)").max(75),
  username: z.string().min(3, "Username (mínimo 3 caracteres)").max(20),
  password: z.string().min(8, "Senha (mínimo 8 caracteres)"),
});


const forumSchema = z.object({
  name: z.string().min(8, "Título(mínimo 8 caracteres)").max(20),
  description: z.string().min(8, "Descrição(mínimo 8 caracteres)").max(100)
});

app.get('/sign-in', (req, res) => {
  const login = readDB();
  res.json(login);
});

//post sign-in basicamente pronto
app.post("/sign-in", async (req, res) => {
  const validation = loginSchema.safeParse(req.body);
//post sign-in basicamente pronto 
app.post('/sign-in', async (req, res) => {
  const validation = signinSchema.safeParse(req.body);

  if (!validation.success) {
    return res
      .status(400)
      .json({ error: "Invalid data", detail: validation.error.format() });
  }

  const { email, name, username, password } = validation.data;
  try {
    const userExists = await searchLogins(username, email);
    if (userExists) {
      return res.status(409).json({ error: 'username / email already in use ' });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await addLogin(name, username, email, hashedPassword);
    await printLogins();
    res.status(201).json({ message: "Username created with success!", username });


  } catch (error) {
    // 1. Print the full error to your terminal
    console.error("CRITICAL ERROR IN /sign-in:", error);

    // 2. You can also send the error message to Postman/Frontend temporarily for debugging
    res.status(500).json({
      error: "Error processing password",
      details: error.message, // Remove this line before putting your app in production!
    });
  }
});

app.post("/login", async (req, res) => {
  const { userEmail, password } = req.body;
  try {
    let isAuthenticated = await validateLoginCredentials(userEmail, password);
    if (isAuthenticated.authenticated) {
      //entrou
      user_id = isAuthenticated.user.id;
      res.status(200).json(isAuthenticated.user);
    } else {
      //fica na tela de login pq nao entrou
      console.log('login failed', isAuthenticated.message);
      res.status(401).json({ error: isAuthenticated.message });
    }
  } catch (error) {
    console.log("internal server error", error.message);
  }
});

async function findIDByUsername(username) {
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
}

async function searchForums(name) {
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
}

let forum_id;

async function createForum(name, description, user_id) {
  let connect;
  try {
    connect = await pool.connect();
    console.log('conexão sucedida createForum');




    await pool.query('CALL publico.inserir_forum( $1, $2, $3)', [name, description, user_id]);

  } catch (error) {
    errorMsg(error);
  }
}

app.get('/forums', async (req, res) => {
  const { name } = req.body;
  try {
    const returnvalue = await searchForums(name);
    forum_id = returnvalue.rows[0].id;
    return res.status(200).json({ message: 'forum id adquired successfully', forum_id });

  } catch (error) {
    errorMsg(error);
    return res.status(500).json({ error: error in server });
  }
});




app.post('/forums', async (req, res) => {

  const validation = forumSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(406).json({ error: "Invalid data", detail: validation.error.format() });
  }

  const { name, description } = validation.data;
  try {

    await createForum(name, description, user_id);
    console.log('forum created');
    return res.status(200).json({ message: 'forum created successfully', name, description, user_id });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'forum with this name already exists' });
    }
    errorMsg(error);
    return res.status(500).json({ error: 'error in server' });
  }
});


app.listen(8000, () => console.log('Rodando!'));





