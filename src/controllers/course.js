const prisma = require("../prisma");

exports.getCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({ include: { lessons: true } });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener cursos", error });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({ where: { id: Number(id) }, include: { lessons: true } });
    if (!course) return res.status(404).json({ msg: "Curso no encontrado" });
    res.json(course);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener curso", error });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, description, level } = req.body;
    if (!title) return res.status(400).json({ msg: "El título es requerido" });
    
    const course = await prisma.course.create({ data: { title, description, level } });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ msg: "Error al crear curso", error });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, level } = req.body;
    
    const existing = await prisma.course.findUnique({ where: { id: Number(id) } });
    if (!existing) return res.status(404).json({ msg: "Curso no encontrado" });
    const course = await prisma.course.update({ where: { id: Number(id) }, data: { title, description, level } });
    res.json(course);
  } catch (error) {
    res.status(500).json({ msg: "Error al actualizar curso", error });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.course.findUnique({ where: { id: Number(id) } });
    if (!existing) return res.status(404).json({ msg: "Curso no encontrado" });
    await prisma.course.delete({ where: { id: Number(id) } });
    res.json({ msg: "Curso eliminado" });
  } catch (error) {
    res.status(500).json({ msg: "Error al eliminar curso", error });
  }
};
