const jwt = require("jsonwebtoken");

const path = require("path");
const envPath = path.resolve(__dirname, "../../src/.env");
const { ok, fail } = require("../helpers/response.js");

require("dotenv").config({ path: envPath });

const passAccess = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
<<<<<<< HEAD
  const token = req.cookies?.auth_token;

  if (!token) {
    return res.status(401).json({ error: "Access denied, token not provided" });
  }

=======
  // TODO: Replace lines 12–18 (Authorization header read + Bearer split) with:
  //   const token = req.cookies?.auth_token;
  //   if (!token) return res.status(401).json({ error: "Access denied, token not provided" });
  //   try { req.user = jwt.verify(token, passAccess); next(); }
  //   catch { return res.status(403).json({ error: "Token expired or invalid" }); }
  // Requires cookie-parser registered in the Express entry point before this middleware.
  // Cookie name 'auth_token' must match what authController.login sets.

  const token = req.cookies?.auth_token;
  if (!token) return fail(res, 401, "Acces denied, token not provided");
>>>>>>> ef4ed8c (fix: missing imports)
  try {
    req.user = jwt.verify(token, passAccess);
    next();
  } catch {
    return res.status(403).json({ error: "Token expired or invalid" });
  }
<<<<<<< HEAD
}
=======
};
>>>>>>> ef4ed8c (fix: missing imports)

module.exports = authMiddleware;
