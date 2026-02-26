const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ msg: "Token requerido" });

  // Extraer el token del formato "Bearer TOKEN"
  let token;
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7); // Remover "Bearer " (7 caracteres)
  } else {
    token = authHeader; // Por si está sin "Bearer" (backward compatibility)
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Error validando token:", err.message);
    res.status(401).json({ msg: "Token inválido" });
  }
};
