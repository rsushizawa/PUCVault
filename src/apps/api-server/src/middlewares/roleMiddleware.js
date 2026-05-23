const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Not Authenticated, user not found" });
    }

    if (!allowedRoles.includes(req.user.cargo)) {
      return res.status(403).json({
        error: `Forbidden: you need one of these roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
