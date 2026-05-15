const authMiddleware = (allowedRoles) => {
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

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Access Denied",
        message: `Your role ${userRole} doens't have permission to access this resource`,
      });
    }
    next();
  };
};

module.exports = roleMiddleware;
