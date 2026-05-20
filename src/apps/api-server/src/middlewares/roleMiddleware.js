const authMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Not Authenticated, user not found" });
    }

    const userRole = req.user.cargo;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Access Denied",
        message: `Your role ${userRole} doens't have permission to access this resource`,
      });
    }
    next();
  };
};

module.exports = authMiddleware;
