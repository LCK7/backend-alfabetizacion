const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Exam = sequelize.define("Exam", {
  question: { type: DataTypes.TEXT, allowNull: false },

  option_a: { type: DataTypes.STRING },
  option_b: { type: DataTypes.STRING },
  option_c: { type: DataTypes.STRING },

  correct_option: { type: DataTypes.STRING },
});

module.exports = Exam;
