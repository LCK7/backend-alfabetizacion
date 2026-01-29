const { Progress } = require("../models");

exports.completeLesson = async (req, res) => {
  const { lessonId } = req.body;

  await Progress.create({
    UserId: req.user.id,
    LessonId: lessonId,
    completed: true,
  });

  res.json({ msg: "Lección completada" });
};
