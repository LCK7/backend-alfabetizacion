const prisma = require("../prisma");
const validation = require("../services/examValidation");

/**
 * GET /exams/:examId
 * Obtiene un examen específico por ID
 */
exports.getExamById = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await validation.validateExamExists(examId);

    // Incluir respuesta correcta para autoevaluación local
    const response = {
      ...exam,
      correctAnswer: exam.correctAnswer // Incluir respuesta correcta para autoevaluación
    };

    res.json(response);
  } catch (err) {
    console.error("[getExamById]", err);
    if (err.status) {
      return res.status(err.status).json({
        error: err.code,
        message: err.message
      });
    }
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Error al obtener examen"
    });
  }
};

/**
 * GET /exams/course/:courseId
 * Lista todos los exámenes de un curso (sin filtrar por lección)
 */
exports.listByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    await validation.validateCourseExists(courseId);

    const exams = await prisma.exam.findMany({
      where: { 
        courseId: Number(courseId)
      },
      orderBy: { order: "asc" },
      select: {
        id: true,
        question: true,
        options: true,
        correctAnswer: true,
        description: true,
        difficulty: true,
        order: true,
        lessonId: true,
        createdAt: true
      }
    });

    res.json(exams);
  } catch (err) {
    console.error("[listByCourse]", err);
    if (err.status) {
      return res.status(err.status).json({
        error: err.code,
        message: err.message
      });
    }
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Error al listar exámenes del curso"
    });
  }
};

/**
 * GET /exams/lesson/:lessonId
 * Lista todos los exámenes de una lección
 */
exports.listByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const exams = await prisma.exam.findMany({
      where: { lessonId: Number(lessonId) },
      orderBy: { order: "asc" },
      select: {
        id: true,
        question: true,
        options: true,
        correctAnswer: true,
        description: true,
        difficulty: true,
        order: true,
        createdAt: true
      }
    });

    res.json(exams);
  } catch (err) {
    console.error("[listByLesson]", err);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Error al listar exámenes de la lección"
    });
  }
};

/**
 * POST /exams
 * Crea un nuevo examen
 */
exports.createExam = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      question,
      options,
      correctAnswer,
      description,
      difficulty,
      courseId,
      lessonId,
      order
    } = req.body;

    // Validar datos de entrada
    const validationErrors = validation.validateExamData({
      question,
      options,
      correctAnswer,
      difficulty,
      courseId
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Los datos del examen no son válidos",
        details: validationErrors
      });
    }

    // Validar que el curso existe
    await validation.validateCourseExists(courseId);

    // Si hay lessonId, validar que existe y pertenece al curso
    if (lessonId) {
      await validation.validateLessonExists(lessonId, courseId);
    }

    // Normalizar opciones sincronizando isCorrect con correctAnswer
    const normalizedOptions = validation.normalizeOptions(options, correctAnswer);

    const exam = await prisma.exam.create({
      data: {
        question: question.trim(),
        options: normalizedOptions,
        correctAnswer,
        description: description ? description.trim() : null,
        difficulty: difficulty || "media",
        order: Number(order) || 1,
        courseId: Number(courseId),
        lessonId: lessonId ? Number(lessonId) : null,
        createdBy: userId
      }
    });

    res.status(201).json({
      success: true,
      message: "Examen creado correctamente",
      data: exam
    });
  } catch (err) {
    console.error("[createExam]", err);
    if (err.status) {
      return res.status(err.status).json({
        error: err.code,
        message: err.message
      });
    }
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Error al crear examen"
    });
  }
};

/**
 * PUT /exams/:examId
 * Actualiza un examen existente
 */
exports.updateExam = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { examId } = req.params;
    const {
      question,
      options,
      correctAnswer,
      description,
      difficulty,
      order
    } = req.body;

    console.log('📝 [updateExam] Iniciando actualización de examen');
    console.log('📝 [updateExam] examId:', examId);
    console.log('📝 [updateExam] userId:', userId, 'userRole:', userRole);
    console.log('📝 [updateExam] Datos recibidos:', {
      question: question ? `"${question.substring(0, 50)}..."` : 'null',
      options: options ? `array[${options.length}]` : 'null',
      correctAnswer,
      description,
      difficulty,
      order
    });

    // Validar que el examen existe
    const exam = await validation.validateExamExists(examId);
    console.log('✅ [updateExam] Examen encontrado, createdBy:', exam.createdBy);

    // Solo validar propiedad si NO es admin
    if (userRole !== "admin") {
      console.log('🔒 [updateExam] No es admin, validando propiedad...');
      validation.validateExamOwnership(exam, userId);
      console.log('✅ [updateExam] Propiedad validada');
    } else {
      console.log('👑 [updateExam] Usuario es admin, saltando validación de propiedad');
    }

    // Validar nuevos datos si se proporcionan
    if (question || options || correctAnswer) {
      console.log('📋 [updateExam] Validando datos del examen...');
      const validationErrors = validation.validateExamData({
        question: question || exam.question,
        options: options || exam.options,
        correctAnswer: correctAnswer || exam.correctAnswer,
        difficulty: difficulty || exam.difficulty,
        courseId: exam.courseId
      });

      if (validationErrors.length > 0) {
        console.warn('⚠️ [updateExam] Errores de validación:', JSON.stringify(validationErrors, null, 2));
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Los datos del examen no son válidos",
          details: validationErrors
        });
      }
      console.log('✅ [updateExam] Validación pasada');
    }

    // Preparar datos para actualización
    const updateData = {};
    if (question !== undefined) updateData.question = question.trim();
    if (options !== undefined) updateData.options = validation.normalizeOptions(options, correctAnswer || exam.correctAnswer);
    if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (order !== undefined) updateData.order = Number(order);

    console.log('📝 [updateExam] updateData final:', JSON.stringify(updateData, null, 2));
    console.log('📝 [updateExam] updateData está vacío?', Object.keys(updateData).length === 0);

    if (Object.keys(updateData).length === 0) {
      console.warn('⚠️ [updateExam] No hay datos para actualizar');
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "No hay campos para actualizar"
      });
    }

    console.log('📝 [updateExam] Ejecutando Prisma.exam.update con:', {
      where: { id: Number(examId) },
      data: updateData
    });

    const updatedExam = await prisma.exam.update({
      where: { id: Number(examId) },
      data: updateData
    });

    console.log('✅ [updateExam] Examen actualizado exitosamente:', {
      id: updatedExam.id,
      question: updatedExam.question.substring(0, 50),
      options: `array[${updatedExam.options.length}]`,
      correctAnswer: updatedExam.correctAnswer,
      updatedAt: updatedExam.updatedAt
    });
    console.log('✅ [updateExam] Datos completos retornados por Prisma:', JSON.stringify({
      id: updatedExam.id,
      question: updatedExam.question,      options: updatedExam.options,
      correctAnswer: updatedExam.correctAnswer,
      description: updatedExam.description,
      difficulty: updatedExam.difficulty,
      order: updatedExam.order,
      updatedAt: updatedExam.updatedAt
    }, null, 2));
    
    res.json({
      success: true,
      message: "Examen actualizado correctamente",
      data: updatedExam
    });
  } catch (err) {
    console.error('❌ [updateExam] Error:', err.message);
    console.error('❌ [updateExam] Stack:', err.stack);
    if (err.status) {
      return res.status(err.status).json({
        error: err.code,
        message: err.message
      });
    }
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Error al actualizar examen"
    });
  }
};

/**
 * DELETE /exams/:examId
 * Elimina un examen
 */
exports.deleteExam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { examId } = req.params;

    // Validar que el examen existe
    const exam = await validation.validateExamExists(examId);

    // Validar pertenencia (solo el creador puede eliminar)
    validation.validateExamOwnership(exam, userId);

    await prisma.exam.delete({
      where: { id: Number(examId) }
    });

    res.json({
      success: true,
      message: "Examen eliminado correctamente"
    });
  } catch (err) {
    console.error("[deleteExam]", err);
    if (err.status) {
      return res.status(err.status).json({
        error: err.code,
        message: err.message
      });
    }
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Error al eliminar examen"
    });
  }
};

/**
 * POST /exams/batch
 * Crea múltiples exámenes en una sola petición
 */
exports.createExamsBatch = async (req, res) => {
  try {
    const userId = req.user.id;
    const { exams } = req.body;

    if (!Array.isArray(exams) || exams.length === 0) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Se requiere un array 'exams' con al menos un examen"
      });
    }

    if (exams.length > 50) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "No se pueden crear más de 50 exámenes a la vez"
      });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < exams.length; i++) {
      const exam = exams[i];

      try {
        const validationErrors = validation.validateExamData({
          question: exam.question,
          options: exam.options,
          correctAnswer: exam.correctAnswer,
          difficulty: exam.difficulty,
          courseId: exam.courseId
        });

        if (validationErrors.length > 0) {
          errors.push({
            index: i,
            message: "validación fallida",
            details: validationErrors
          });
          continue;
        }

        await validation.validateCourseExists(exam.courseId);

        if (exam.lessonId) {
          await validation.validateLessonExists(exam.lessonId, exam.courseId);
        }

        const normalizedOptions = validation.normalizeOptions(exam.options, exam.correctAnswer);

        const created = await prisma.exam.create({
          data: {
            question: exam.question.trim(),
            options: normalizedOptions,
            correctAnswer: exam.correctAnswer,
            description: exam.description ? exam.description.trim() : null,
            difficulty: exam.difficulty || "media",
            order: Number(exam.order) || 1,
            courseId: Number(exam.courseId),
            lessonId: exam.lessonId ? Number(exam.lessonId) : null,
            createdBy: userId
          }
        });

        results.push({
          index: i,
          success: true,
          examId: created.id
        });
      } catch (err) {
        errors.push({
          index: i,
          message: err.message || "Error al crear examen"
        });
      }
    }

    res.status(201).json({
      message: `${results.length} examen(es) creado(s) con éxito`,
      successful: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error("[createExamsBatch]", err);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Error al crear lote de exámenes"
    });
  }
};