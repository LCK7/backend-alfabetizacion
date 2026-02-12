const { Sequelize } = require("sequelize");

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("DATABASE_URL is not set. The application requires a Railway DATABASE_URL to run.");
  process.exit(1);
}

const useSSL = process.env.DB_SSL === "true" || process.env.NODE_ENV === "production";

const sequelize = new Sequelize(dbUrl, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
  dialectOptions: useSSL
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
});

module.exports = { sequelize };
