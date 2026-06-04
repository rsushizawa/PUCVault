const authService = require("../services/userServices");
const userServices = require("../services/userServices");
const emailServices = require("../services/emailServices");
const { ok, fail } = require("../helpers/response.js");
const { z } = require("zod");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const path = require("path");
const { is } = require("zod/v4/locales");
const { maxHeaderSize } = require("http");

const envPath = path.resolve(__dirname, "../../src/.env");

require("dotenv").config({ path: envPath });

const passAccess = process.env.JWT_SECRET;

const saltRounds = 10;

const generateRandomPIN = () => crypto.randomInt(100000, 999999).toString();

const generateJWTToken = (payload, purpose) => {
  return jwt.sign({ ...payload, purpose: purpose }, passAccess, {
    expiresIn: "15m",
  });
};

const signinSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email").max(50),
  name: z.string().min(3, "Nome(mínimo 3 caracteres)").max(75),
  username: z.string().min(3, "Username (mínimo 3 caracteres)").max(20),
  password: z.string().min(8, "Senha (mínimo 8 caracteres)"),
  twofacauth: z.boolean().default(false),
});

exports.print = async (req, res) => {
  try {
    const loginResult = await authService.printLogins();
    const rows = loginResult.rows;
    console.table(rows);
    return ok(res, rows);
  } catch (error) {
    console.log("internal server error", error.message);
    return fail(res, 500, "internal server error");
  }
};

exports.signin = async (req, res) => {
  const validation = signinSchema.safeParse(req.body);

  if (!validation.success) {
    return fail(res, 400, validation.error.format());
  }

  const { email, name, username, password, twofacauth } = validation.data;
  try {
    const userExists = await authService.searchLogins(username, email);
    if (userExists) {
      return fail(res, 409, "username / email already in use");
    }

    const pin = generateRandomPIN();
    const pinHash = await bcrypt.hash(pin, saltRounds);

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const signupToken = generateJWTToken(
      { email, name, username, hashedPassword, twofacauth, pinHash: pinHash },
      "email_verification",
    );

    await emailServices.sendEmail(email, pin, "email_verification");

    res.cookie("signup_token", signupToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    return res.status(200).json({ message: "PIN sent to email" });
  } catch (error) {
    console.error("CRITICAL ERROR IN /sign-in:", error);

    res.status(500).json({
      error: "Error processing password",
      details: error.message, // Remove this line before putting your app in production!
    });
  }
};

exports.verifySignup = async (req, res) => {
  const { pin_input } = req.body;
  const signupToken = req.cookies?.signup_token;
  if (!signupToken) {
    return res.status(401).json({ error: "missing signup token" });
  }
  try {
    const payload = jwt.verify(signupToken, passAccess);
    if (payload.purpose !== "email_verification") {
      return res.status(403).json({ error: "invalid token" });
    }
    const isPinCorrect = await bcrypt.compare(pin_input, payload.pinHash);
    if (!isPinCorrect) {
      return res.status(401).json({ error: "token incorrect" });
    }
    await authService.addLogin(
      payload.name,
      payload.username,
      payload.email,
      payload.hashedPassword,
    );
    if (payload.twofacauth) {
      console.log(
        "➡️ Entrou no condicional payload.twofacauth! Ativando 2FA...",
      );
      const result = await authService.getUserInfoByEmail(payload.email);
      const user = result.rows
        ? result.rows[0]
        : Array.isArray(result)
          ? result[0]
          : result;
      const user_id = user.id;
      await authService.toggle2FA(user_id);
    }
    res.clearCookie("signup_token", { httpOnly: true, sameSite: "strict" });
    return res.status(201).json({ message: "user created with success" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "PIN time expired" });
    }
    return res.status(401).json({ error: "Token Invalid" });
  }
};

const loginSchema = z.object({
  userEmail: z
    .string()
    .trim()
    .min(3, "Insira um email ou username válido")
    .refine(
      (valor) => {
        // Se tiver '@', nós forçamos a testar como email
        if (valor.includes("@")) {
          const emailValidation = z.string().email().safeParse(valor);
          return emailValidation.success;
        }
        // Se não tiver '@', assumimos que é username (e já passou no min(3) lá em cima)
        return true;
      },
      {
        message: "Formato de email inválido",
      },
    ),

  password: z.string().min(8, "Senha (mínimo 8 caracteres)"),
  keep_connected: z.boolean().default(false),
});

exports.login = async (req, res) => {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    return res
      .status(400)
      .json({ error: "Invalid data", detail: validation.error.format() });
  }

  const { userEmail, password, keep_connected } = validation.data;
  try {
    const isAuthenticated = await authService.validateLoginCredentials(
      userEmail,
      password,
    );
    if (isAuthenticated.authenticated) {
      const user =
        isAuthenticated.user ||
        (isAuthenticated.rows && isAuthenticated.rows[0]);

      if (!user.a2f) {
        const token = jwt.sign(
          { id: user.id, cargo: user.cargo },
          passAccess,
          keep_connected ? { expiresIn: "1m" } : { expiresIn: "1d" },
        );
        res.cookie("auth_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 86400000,
        });
        return res.status(200).json({ message: "login success", user });
      } else {
        const pin = generateRandomPIN();
        const pinHash = await bcrypt.hash(pin, saltRounds);

        const twoFacToken = generateJWTToken(
          {
            id: user.id,
            cargo: user.cargo,
            pinHash: pinHash,
          },
          "2fa",
        );

        await emailServices.sendEmail(user.email, pin, "2fa");

        return res.status(200).json({
          message: "PIN sent to email successfully",
          twoFacToken,
        });
      }
    } else {
      return res.status(401).json({ error: "user or password incorrect" });
    }
  } catch (error) {
    console.error("internal server error", error.message);
    return res.status(500).json({ error: "internal server error" });
  }
};

exports.verifyLogin = async (req, res) => {
  const { twoFacToken, pin_input } = req.body;
  console.log("conexao sucedida verifyLogin");

  try {
    const payload = jwt.verify(twoFacToken, passAccess);

    if (isAuthenticated.authenticated) {
      const cargo = await authService.buscarCargo(isAuthenticated.user.id);
      const token = jwt.sign(
        { id: isAuthenticated.user.id, cargo },
        passAccess,
        { expiresIn: "1d" },
      );
      return ok(res, { user: isAuthenticated.user, token });
    } else {
      return fail(res, 401, isAuthenticated.message);
    }

    const isPinCorrect = await bcrypt.compare(pin_input, payload.pinHash);

    if (!isPinCorrect) {
      return res.status(401).json({ error: "PIN incorrect" });
    }

    const token = jwt.sign(
      { id: payload.id, cargo: payload.cargo },
      passAccess,
      { expiresIn: "1d" },
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400000,
    });

    return res
      .status(200)
      .json({ message: "user authenticated and logged in" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ error: "token expired" });
    }
    return res.status(401).json({ error: "invalid token" });
  }
};

const changePasswordSchema = z
  .object({
    password: z.string().min(8),
    new_password: z
      .string()
      .min(8, "A nova senha deve ter no mínimo 8 caracteres"),
    confirm: z.string(),
  })
  .refine((data) => data.new_password === data.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"], // O erro vai aparecer focado no campo 'confirm'
  })
  .refine((data) => data.new_password !== data.password, {
    message: "A nova senha deve ser diferente da atual",
    path: ["new_password"],
  });

exports.changePassword = async (req, res) => {
  try {
    const validation = changePasswordSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Erro de validação",
        details: validation.error.flatten().fieldErrors,
      });
    }
    const { password, new_password } = validation.data;

    const user_id = req.user.id;

    const user = await userServices.getHashById(user_id);
    const passwordValid = await bcrypt.compare(password, user.senha_hash);

    if (!passwordValid) {
      return res.status(401).json({ message: "wrong current password" });
    }

    const new_hash = await bcrypt.hash(new_password, saltRounds);

    await authService.changePassword(user_id, new_hash);

    return res.status(200).json({ message: "password changed successfully" });
  } catch (error) {
    console.error("internal server error", error.message);
    res.status(500).json({ error: "internal server error" });
  }
};

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email").max(50),
});

exports.logout = (req, res) => {
  res.clearCookie("auth_token", { httpOnly: true, sameSite: "strict" });
  return res.status(200).json({ message: "logged out" });
};

exports.forgotPasswordSendEmail = async (req, res) => {
  const validation = emailSchema.safeParse(req.body);

  if (!validation.success) {
    return res
      .status(400)
      .json({ error: "Invalid data", detail: validation.error.format() });
  }
  const { email } = validation.data;
  const result = await authService.getUserInfoByEmail(email);
  const user = result.rows
    ? result.rows[0]
    : Array.isArray(result)
      ? result[0]
      : result;

  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  const pin = generateRandomPIN();
  const pinHash = await bcrypt.hash(pin, saltRounds);

  const sent_token = generateJWTToken(
    { id: user.id, pinHash },
    "password_recovery",
  );

  try {
    await emailServices.sendEmail(email, pin, "password_recovery");
    return res.status(200).json({
      message: "PIN enviado para o email com sucesso",
      pinToken: sent_token,
    });
  } catch (error) {
    console.error("internal server error", error.message);
    res.status(500).json({ error: "internal server error" });
  }
};

const forgotPasswordSchema = z
  .object({
    pinToken: z.string(),
    pin: z.string().max(6).min(6),
    new_password: z
      .string()
      .min(8, "A nova senha deve ter no mínimo 8 caracteres"),
    confirm: z.string(),
  })
  .refine((data) => data.new_password === data.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

exports.forgotChangePassword = async (req, res) => {
  try {
    const validation = forgotPasswordSchema.safeParse(req.body);

    if (!validation.success) {
      return res
        .status(400)
        .json({ error: "Invalid data", detail: validation.error.format() });
    }

    const { pinToken, pin, new_password } = validation.data;

    const payload = jwt.verify(pinToken, passAccess);
    if (payload.purpose !== "password_recovery") {
      return res.status(403).json({ error: "token invalid for this purpose" });
    }

    const user_id = payload.id;
    const tokenHash = payload.pinHash;
    const isPinCorrect = await bcrypt.compare(pin, tokenHash);

    if (!isPinCorrect) {
      return res.status(401).json({ error: "PIN Incorrect" });
    }

    const new_hash = await bcrypt.hash(new_password, saltRounds);
    await userServices.changePassword(user_id, new_hash);
    return res
      .status(200)
      .json({ message: "user has successfully recovered his account" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "token has expired. create a new one" });
    }
    res.status(401).json({ error: "Invalid Token" });
  }
};
