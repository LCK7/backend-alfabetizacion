/**
 * Servicio de validación para exámenes
 * Centraliza todas las reglas de validación para exámenes
 */

const prisma = require("../prisma");

/**
 * Valida que un curso exista
 */
exports.validateCourseExists = async (courseId) => {
  const course = await prisma.course.findUnique({
    where: { id: Number(courseId) }
  });

  if (!course) {
    throw {
      status: 404,
      message: "El curso no existe",
      code: "COURSE_NOT_FOUND"
    };
  }

  return course;
};

/**
 * Valida que una lección exista y pertenezca al curso
 */
exports.validateLessonExists = async (lessonId, courseId) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: Number(lessonId) }
  });

  if (!lesson) {
    throw {
      status: 404,
      message: "La lección no existe",
      code: "LESSON_NOT_FOUND"
    };
  }

  if (lesson.courseId !== Number(courseId)) {
    throw {
      status: 400,
      message: "La lección no pertenece al curso especificado",
      code: "LESSON_NOT_IN_COURSE"
    };
  }

  return lesson;
};

/**
 * Valida los datos de creación/actualización de un examen
 */
exports.validateExamData = (data) => {
  const errors = [];

  // Validar pregunta
  if (!data.question || typeof data.question !== "string") {
    errors.push({
      field: "question",
      message: "La pregunta es obligatoria y debe ser texto"
    });
  } else if (data.question.trim().length < 10) {
    errors.push({
      field: "question",
      message: "La pregunta debe tener al menos 10 caracteres"
    });
  }

  // Validar opciones
  if (!Array.isArray(data.options) || data.options.length < 2) {
    errors.push({
      field: "options",
      message: "Debe proporcionar al menos 2 opciones"
    });
  } else if (data.options.length > 5) {
    errors.push({
      field: "options",
      message: "No puede haber más de 5 opciones"
    });
  } else {
    // Validar cada opción
    data.options.forEach((opt, idx) => {
      if (!opt.text || typeof opt.text !== "string") {
        errors.push({
          field: `options.${idx}.text`,
          message: "Cada opción debe tener un texto"
        });
      }
      if (opt.text && opt.text.trim().length < 2) {
        errors.push({
          field: `options.${idx}.text`,
          message: "El texto de la opción debe tener al menos 2 caracteres"
        });
      }
    });
  }

  // Validar respuesta correcta
  if (!data.correctAnswer || typeof data.correctAnswer !== "string") {
    errors.push({
      field: "correctAnswer",
      message: "Debe especificar la respuesta correcta"
    });
  } else {
    const isValidAnswer = data.options?.some(opt => opt.id === data.correctAnswer);
    if (!isValidAnswer) {
      errors.push({
        field: "correctAnswer",
        message: "La respuesta correcta debe corresponder a una de las opciones"
      });
    }
  }

  // Validar dificultad
  const validDifficulties = ["facil", "media", "dificil"];
  if (data.difficulty && !validDifficulties.includes(data.difficulty)) {
    errors.push({
      field: "difficulty",
      message: "La dificultad debe ser: facil, media o dificil"
    });
  }

  // Validar courseId
  if (!data.courseId) {
    errors.push({
      field: "courseId",
      message: "El ID del curso es obligatorio"
    });
  }

  return errors;
};

/**
 * Valida que un examen exista
 */
exports.validateExamExists = async (examId) => {
  const exam = await prisma.exam.findUnique({
    where: { id: Number(examId) }
  });

  if (!exam) {
    throw {
      status: 404,
      message: "El examen no existe",
      code: "EXAM_NOT_FOUND"
    };
  }

  return exam;
};

/**
 * Valida que el usuario sea el creador del examen (para edición)
 */
exports.validateExamOwnership = (exam, userId) => {
  if (exam.createdBy !== userId) {
    throw {
      status: 403,
      message: "No tienes permiso para modificar este examen",
      code: "UNAUTHORIZED_EXAM_EDIT"
    };
  }
};

/**
 * Valida la respuesta de un usuario a un examen
 */
exports.validateExamAnswer = (exam, selectedAnswerId) => {
  if (!selectedAnswerId || typeof selectedAnswerId !== "string") {
    throw {
      status: 400,
      message: "Debe proporcionar una respuesta",
      code: "INVALID_ANSWER"
    };
  }

  const validOption = exam.options.find(opt => opt.id === selectedAnswerId);
  if (!validOption) {
    throw {
      status: 400,
      message: "La respuesta no corresponde a ninguna opción del examen",
      code: "ANSWER_NOT_FOUND"
    };
  }

  return validOption;
};

/**
 * Procesa la formato estándar de opciones
 */
exports.normalizeOptions = (optionsData, correctAnswerId) => {
  if (!Array.isArray(optionsData)) {
    return [];
  }

  return optionsData.map((opt, idx) => ({
    id: opt.id || `opt-${Date.now()}-${idx}`,
    text: String(opt.text || "").trim(),
    // Sincronizar isCorrect con correctAnswerId si se proporciona
    isCorrect: correctAnswerId ? (opt.id === correctAnswerId) : (Boolean(opt.isCorrect) || false)
  }));
};
