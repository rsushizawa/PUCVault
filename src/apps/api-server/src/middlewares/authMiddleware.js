const jwt = require('jsonwebtoken');

const path = require('path');
const envPath = path.resolve(__dirname, '../../src/.env');

require('dotenv').config({ path: envPath });

const passAccess = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Access denied, token not provided" });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decode = jwt.verify(token, passAccess);

    req.user = decode;

    next();
  } catch (error) {
    return res.status(403).json({ error: "Token expired or invalid" });
  }


}

module.exports = authMiddleware;
