
const authService = require('../services/userServices');
const { ok, fail } = require('../helpers/response');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const path = require('path');
const envPath = path.resolve(__dirname, '../../src/.env');

require('dotenv').config({ path: envPath });

const passAccess = process.env.JWT_SECRET;

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
    const loginResult = await authService.printLogins();
    const rows = loginResult.rows;
    console.table(rows);
    return ok(res, rows);
  } catch (error) {
    console.log('internal server error', error.message);
    return fail(res, 500, 'internal server error');
  }
};



const signin = async (req, res) => {
  const validation = signinSchema.safeParse(req.body);

  if (!validation.success) {
    return fail(res, 400, validation.error.format());
  }

  const { email, name, username, password } = validation.data;
  try {
    const userExists = await authService.searchLogins(username, email);
    if (userExists) {
      return fail(res, 409, 'username / email already in use');
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await authService.addLogin(name, username, email, hashedPassword);
    await authService.printLogins();
    return ok(res, { username });

  } catch (error) {
    console.error("CRITICAL ERROR IN /sign-in:", error);
    return fail(res, 500, error.message);
  }

};

const login = async (req, res) => {
  const { userEmail, password } = req.body;

  try {
    const isAuthenticated = await authService.validateLoginCredentials(userEmail, password);

    if (isAuthenticated.authenticated) {
      const token = jwt.sign(
        { id: isAuthenticated.user.id },
        passAccess,
        { expiresIn: '1d' }
      );
      return ok(res, { user: isAuthenticated.user, token });
    } else {
      return fail(res, 401, isAuthenticated.message);
    }

  } catch (error) {
    console.error('internal server error', error.message);
    return fail(res, 500, 'internal server error');
  }
};



module.exports = { print, login, signin };
