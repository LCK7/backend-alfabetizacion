const prisma = require("../prisma");

exports.createExam = async (req, res) => {
  try {
    const { question, option_a, option_b, option_c, correct_option, courseId, lessonId } = req.body;
    if (!question || !courseId) return res.status(400).json({ msg: "question y courseId son requeridos" });

    const data = { question, option_a, option_b, option_c, correct_option, courseId: Number(courseId) };
    if (lessonId) data.lessonId = Number(lessonId);

    const exam = await prisma.exam.create({ data });
    res.status(201).json(exam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error creando examen" });
  }
};

exports.listByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const exams = await prisma.exam.findMany({ where: { courseId: Number(courseId) } });
    res.json(exams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al listar examenes" });
  }
};

exports.listByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const exams = await prisma.exam.findMany({ where: { lessonId: Number(lessonId) } });
    res.json(exams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al listar examenes por leccion" });
  }
};

exports.createExams = async (req, res) => {
  try {
    const { exams } = req.body; // expect array of exams
    if (!Array.isArray(exams) || exams.length === 0) return res.status(400).json({ msg: "Se requiere un arreglo 'exams'" });

    const created = [];
    for (const item of exams) {
      const { question, option_a, option_b, option_c, correct_option, courseId, lessonId } = item;
      if (!question || !courseId) continue;
      const data = { question, option_a, option_b, option_c, correct_option, courseId: Number(courseId) };
      if (lessonId) data.lessonId = Number(lessonId);
      const ex = await prisma.exam.create({ data });
      created.push(ex);
    }

    res.status(201).json({ created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error creando examenes" });
  }
};
