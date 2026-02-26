const prisma = require("../prisma");
const { createChatCompletion } = require("../services/openai");
const { predecirComplejidadTexto } = require("../services/mlService");

exports.getLessons = async (req, res) => {
  try {
    const { courseId } = req.query;

    const where = courseId
      ? { where: { courseId: Number(courseId) } }
      : { where: {} };

    const lessons = await prisma.lesson.findMany(where);

    res.json(lessons);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener lecciones", error });
  }
};

exports.getLessonById = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(id) }
    });

    if (!lesson)
      return res.status(404).json({ msg: "Lección no encontrada" });

    res.json(lesson);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener lección", error });
  }
};

exports.createLesson = async (req, res) => {
  try {
    const { courseId, title, content, video_url, order, resources } = req.body;

    if (!courseId || !title) {
      return res.status(400).json({ msg: "courseId y title son requeridos" });
    }

    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) }
    });

    if (!course) {
      return res.status(404).json({ msg: "Curso no encontrado" });
    }

    let complexity = 0;
    let suggestion = null;
    let isHigh = false;

    if (content) {
      try {
        complexity = await predecirComplejidadTexto(content);

        if (complexity > 0.25) {  // Umbral de complejidad 25%
          isHigh = true;

          const result = await createChatCompletion({
            messages: [
              {
                role: "system",
                content: `
Eres un experto en alfabetización digital para adultos mayores (50 a 65 años).
- Lenguaje muy simple
- Frases cortas
- Máximo 5 pasos
- Sin palabras técnicas
Devuelve solo el texto simplificado.
`
              },
              {
                role: "user",
                content: `
Título: ${title}

Texto:
${content}

Simplifica este texto.
`
              }
            ],
            temperature: 0.3,
            max_tokens: 300,
            model: "gpt-4.1-mini"
          });

          suggestion = result?.output?.[0]?.content?.[0]?.text || null;
        }
      } catch (err) {
        console.error("Error ML o LLM:", err.message);
      }
    }

    const lesson = await prisma.lesson.create({
      data: {
        courseId: Number(courseId),
        title,
        content,
        video_url,
        order: order || 1,
        resources: resources || []
      }
    });

    res.status(201).json({
      lesson,
      complexity,
      isHigh,
      suggestion
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al crear lección",
      error: error.message
    });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, video_url, order, resources } = req.body;

    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(id) }
    });

    if (!lesson) {
      return res.status(404).json({ msg: "Lección no encontrada" });
    }

    let complexity = 0;
    let suggestion = null;
    let isHigh = false;

    if (content) {
      try {
        complexity = await predecirComplejidadTexto(content);

        if (complexity > 0.25) { // Umbral 25%
          isHigh = true;

          const result = await createChatCompletion({
            messages: [
              {
                role: "system",
                content: `
Eres un experto en alfabetización digital para adultos mayores (50 a 65 años).
- Lenguaje muy simple
- Frases cortas
- Máximo 5 pasos
- Sin palabras técnicas
Devuelve solo el texto simplificado.
`
              },
              {
                role: "user",
                content: `
Título: ${title}

Texto:
${content}

Simplifica este texto.
`
              }
            ],
            temperature: 0.3,
            max_tokens: 300,
            model: "gpt-4.1-mini"
          });

          suggestion = result?.output?.[0]?.content?.[0]?.text || null;
        }
      } catch (err) {
        console.error("Error ML o LLM:", err.message);
      }
    }

    const updated = await prisma.lesson.update({
      where: { id: Number(id) },
      data: {
        title,
        content,
        video_url,
        order,
        resources: resources || lesson.resources || []
      }
    });

    res.json({
      lesson: updated,
      complexity,
      isHigh,
      suggestion
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al actualizar lección",
      error: error.message
    });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(id) }
    });

    if (!lesson)
      return res.status(404).json({ msg: "Lección no encontrada" });

    await prisma.lesson.delete({
      where: { id: Number(id) }
    });

    res.json({ msg: "Lección eliminada" });
  } catch (error) {
    res.status(500).json({ msg: "Error al eliminar lección", error });
  }
};