const prisma = require("../prisma");

exports.completeLesson = async (req, res) => {
  const { lessonId } = req.body;

  try {
    const id = Number(lessonId);
    if (!id) return res.status(400).json({ msg: "lessonId inválido" });

    // upsert: evita duplicados
    const existing = await prisma.progress.findFirst({ where: { userId: req.user.id, lessonId: id } });
    let progressRecord;
    if (!existing) {
      progressRecord = await prisma.progress.create({ data: { userId: req.user.id, lessonId: id, completed: true } });
    } else if (!existing.completed) {
      progressRecord = await prisma.progress.update({ where: { id: existing.id }, data: { completed: true } });
    } else {
      progressRecord = existing;
    }

    res.json({ msg: "Lección completada", progress: progressRecord });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error de servidor" });
  }
};

exports.listMyProgress = async (req, res) => {
  try {
    const items = await prisma.progress.findMany({ where: { userId: req.user.id }, select: { lessonId: true, completed: true } });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al obtener progreso" });
  }
};
