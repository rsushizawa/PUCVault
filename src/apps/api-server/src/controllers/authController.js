const authService = require('../services/userServices');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const path = require('path');
const envPath = path.resolve(__dirname, '../../src/.env');

require('dotenv').config({ path: envPath });

const passAccess = process.env.DB_PASS;

//deleteUser(user_id)

const saltRounds = 10;


const signinSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email").max(50),
  name: z.string().min(3, "Nome(mínimo 3 caracteres)").max(75),
  username: z.string().min(3, "Username (mínimo 3 caracteres)").max(20),
  password: z.string().min(8, "Senha (mínimo 8 caracteres)")
});

const print = async (req, res) => {
  try {
    await authService.printLogins();
  } catch (error) {
    console.log('internal server error', error.message);
  }
};



const signin = async (req, res) => {
  const validation = signinSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({ error: "Invalid data", detail: validation.error.format() });
  }

  const { email, name, username, password } = validation.data;
  try {
    const userExists = await authService.searchLogins(username, email);
    if (userExists) {
      return res.status(409).json({ error: 'username / email already in use ' });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await authService.addLogin(name, username, email, hashedPassword);
    await authService.printLogins();
    res.status(201).json({ message: "Username created with success!", username });


  } catch (error) {
    console.error("CRITICAL ERROR IN /sign-in:", error);

    res.status(500).json({
      error: "Error processing password",
      details: error.message // Remove this line before putting your app in production!
    });

  }

};

const login = async (req, res) => {
  const { userEmail, password } = req.body;

  try {
    let isAuthenticated = await authService.validateLoginCredentials(userEmail, password);
    const token = jwt.sign(
      { id: isAuthenticated.user.id },
      passAccess,
      { expiresIn: '1d' }
    );

    if (isAuthenticated.authenticated) {
      //entrou
      res.status(200).json({
        message: "login success",
        user: isAuthenticated.user,
        token: token
      });
    }
    else {
      //fica na tela de login pq nao entrou
      console.log('login failed', isAuthenticated.message);
      res.status(401).json({ error: isAuthenticated.message });
    }

  } catch (error) {
    console.log('internal server error', error.message);
  }
};



module.exports = { print, login, signin };

