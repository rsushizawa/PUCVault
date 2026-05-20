const jwt = require('jsonwebtoken');

const path = require('path');
const envPath = path.resolve(__dirname, '../../src/.env');

require('dotenv').config({ path: envPath });

const passAccess = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.auth_token;

  if (!token) {
    return res.status(401).json({ error: "Access denied, token not provided" });
  }

  try {
    req.user = jwt.verify(token, passAccess);
    next();
  } catch {
    return res.status(403).json({ error: "Token expired or invalid" });
  }
}

module.exports = authMiddleware;
