const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ExamResult = sequelize.define("ExamResult", {
  score: { type: DataTypes.INTEGER, defaultValue: 0 },
});

module.exports = ExamResult;
