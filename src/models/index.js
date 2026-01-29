const User = require("./User");
const Course = require("./Course");
const Lesson = require("./Lesson");
const Progress = require("./Progress");
const Exam = require("./Exam");
const ExamResult = require("./ExamResult");

/* Relaciones */

Course.hasMany(Lesson);
Lesson.belongsTo(Course);

User.belongsToMany(Lesson, { through: Progress });
Lesson.belongsToMany(User, { through: Progress });

Course.hasMany(Exam);
Exam.belongsTo(Course);

User.hasMany(ExamResult);
ExamResult.belongsTo(User);

Exam.hasMany(ExamResult);
ExamResult.belongsTo(Exam);

module.exports = {
  User,
  Course,
  Lesson,
  Progress,
  Exam,
  ExamResult,
};
