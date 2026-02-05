const { User } = require("../models");

module.exports = (requiredRole) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: "Token requerido" });
    }

    try {
      const dbUser = await User.findByPk(req.user.id);
      if (!dbUser) return res.status(404).json({ msg: "Usuario no encontrado" });

      if (dbUser.role !== requiredRole) {
        return res.status(403).json({ msg: `Se requiere rol ${requiredRole}` });
      }
      req.user.role = dbUser.role;

      next();
    } catch (error) {
      console.error("Role middleware error:", error);
      res.status(500).json({ msg: "Error interno al verificar rol" });
    }
  };
};
