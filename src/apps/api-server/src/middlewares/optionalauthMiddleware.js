const jwt = require("jsonwebtoken");

const path = require("path");
const envPath = path.resolve(__dirname, "../.env");

require("dotenv").config({ path: envPath });

const passAccess = process.env.JWT_SECRET;

const optionalauthMiddleware = (req, res, next) => {
  const token = req.cookies?.auth_token;
  if (token) {
    try {
      req.user = jwt.verify(token, passAccess);
    } catch {}
  }
  next();
};

module.exports = optionalauthMiddleware;
