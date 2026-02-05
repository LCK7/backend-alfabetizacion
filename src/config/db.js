const { Sequelize } = require("sequelize");

let sequelize;

if (process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL) {
  // Priorizar DATABASE_URL (internal), si no existe usar DATABASE_PUBLIC_URL (public-facing)
  const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
  // Usar URL completa (p. ej. proporcionada por Railway)
  sequelize = new Sequelize(dbUrl, {
    dialect: "postgres",
    protocol: "postgres",
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === "true" || process.env.NODE_ENV === "production" ? {
        require: true,
        rejectUnauthorized: false,
      } : false,
    },
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: "postgres",
      logging: false,
    }
  );
}

module.exports = { sequelize };
