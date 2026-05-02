const jwt = require('jsonwebtoken');

const path = require('path');
const envPath = path.resolve(__dirname, '../../src/.env');

require('dotenv').config({ path: envPath });

const passAccess = process.env.JWT_SECRET;

const optionalauthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    if (token) {
      try {
        const decode = jwt.verify(token, passAccess);
        req.user = decode;
      } catch (error) {
      }
    }
  }
  next();
}

module.exports = optionalauthMiddleware;
