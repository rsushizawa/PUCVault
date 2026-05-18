const jwt = require("jsonwebtoken");

const path = require("path");
const envPath = path.resolve(__dirname, "../.env");

require("dotenv").config({ path: envPath });

const passAccess = process.env.JWT_SECRET;

const optionalauthMiddleware = (req, res, next) => {
<<<<<<< HEAD
  const token = req.cookies?.auth_token;
=======
  const token = req.cookies?.autho_token;
>>>>>>> ef4ed8c (fix: missing imports)
  if (token) {
    try {
      req.user = jwt.verify(token, passAccess);
    } catch {}
  }
  next();
};

module.exports = optionalauthMiddleware;
