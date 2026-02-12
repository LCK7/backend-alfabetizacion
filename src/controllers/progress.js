const prisma = require("../prisma");

exports.completeLesson = async (req, res) => {
  const { lessonId } = req.body;

  await prisma.progress.create({ data: { userId: req.user.id, lessonId: Number(lessonId), completed: true } });

  res.json({ msg: "Lección completada" });
};
