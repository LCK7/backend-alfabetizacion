const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Progress = sequelize.define("Progress", {
  completed: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = Progress;
