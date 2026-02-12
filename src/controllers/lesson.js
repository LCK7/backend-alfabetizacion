const prisma = require("../prisma");

exports.getLessons = async (req, res) => {
  try {
    const { courseId } = req.query;
    const where = courseId ? { where: { courseId: Number(courseId) } } : { where: {} };
    const lessons = await prisma.lesson.findMany(where);
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener lecciones", error });
  }
};

exports.getLessonById = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await prisma.lesson.findUnique({ where: { id: Number(id) } });
    if (!lesson) return res.status(404).json({ msg: "Lección no encontrada" });
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener lección", error });
  }
};

exports.createLesson = async (req, res) => {
  try {
    const { CourseId, title, content, video_url, order } = req.body;
    if (!CourseId || !title) {
      return res.status(400).json({ msg: "CourseId y title son requeridos" });
    }

    // Verificar que el curso existe
    const course = await prisma.course.findUnique({ where: { id: Number(CourseId) } });
    if (!course) return res.status(404).json({ msg: "Curso no encontrado" });

    const lesson = await prisma.lesson.create({ data: { courseId: Number(CourseId), title, content, video_url, order: order || 1 } });
    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ msg: "Error al crear lección", error });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, video_url, order } = req.body;

    const lesson = await prisma.lesson.findUnique({ where: { id: Number(id) } });
    if (!lesson) return res.status(404).json({ msg: "Lección no encontrada" });

    const updated = await prisma.lesson.update({ where: { id: Number(id) }, data: { title, content, video_url, order } });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ msg: "Error al actualizar lección", error });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await prisma.lesson.findUnique({ where: { id: Number(id) } });
    if (!lesson) return res.status(404).json({ msg: "Lección no encontrada" });

    await prisma.lesson.delete({ where: { id: Number(id) } });
    res.json({ msg: "Lección eliminada" });
  } catch (error) {
    res.status(500).json({ msg: "Error al eliminar lección", error });
  }
};
