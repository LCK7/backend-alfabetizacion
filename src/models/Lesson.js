const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Lesson = sequelize.define("Lesson", {
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT },
  video_url: { type: DataTypes.STRING },
  order: { type: DataTypes.INTEGER, defaultValue: 1 },
});

module.exports = Lesson;
