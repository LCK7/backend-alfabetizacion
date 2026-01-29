const { Lesson, Course } = require("../models");

exports.getLessons = async (req, res) => {
  try {
    const { courseId } = req.query;
    const where = courseId ? { CourseId: courseId } : {};
    const lessons = await Lesson.findAll({ where });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener lecciones", error });
  }
};

exports.getLessonById = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findByPk(id);
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
    const course = await Course.findByPk(CourseId);
    if (!course) return res.status(404).json({ msg: "Curso no encontrado" });

    const lesson = await Lesson.create({
      CourseId,
      title,
      content,
      video_url,
      order: order || 1,
    });
    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ msg: "Error al crear lección", error });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, video_url, order } = req.body;

    const lesson = await Lesson.findByPk(id);
    if (!lesson) return res.status(404).json({ msg: "Lección no encontrada" });

    await lesson.update({ title, content, video_url, order });
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ msg: "Error al actualizar lección", error });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findByPk(id);
    if (!lesson) return res.status(404).json({ msg: "Lección no encontrada" });

    await lesson.destroy();
    res.json({ msg: "Lección eliminada" });
  } catch (error) {
    res.status(500).json({ msg: "Error al eliminar lección", error });
  }
};
