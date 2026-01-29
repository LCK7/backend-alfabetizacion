require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./config/db");

require("./models");

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(() => {
  console.log("Base de datos sincronizada");

  app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto", PORT);
  });
});
