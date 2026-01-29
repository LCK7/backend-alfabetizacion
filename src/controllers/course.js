const { Course, Lesson } = require("../models");

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({ include: [Lesson] });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener cursos", error });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id, { include: [Lesson] });
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
    
    const course = await Course.create({ title, description, level });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ msg: "Error al crear curso", error });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, level } = req.body;
    
    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ msg: "Curso no encontrado" });
    
    await course.update({ title, description, level });
    res.json(course);
  } catch (error) {
    res.status(500).json({ msg: "Error al actualizar curso", error });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ msg: "Curso no encontrado" });
    
    await course.destroy();
    res.json({ msg: "Curso eliminado" });
  } catch (error) {
    res.status(500).json({ msg: "Error al eliminar curso", error });
  }
};
