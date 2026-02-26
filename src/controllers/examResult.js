const prisma = require("../prisma");
const validation = require("../services/examValidation");

exports.validateAnswer = async (req, res) => {
  try {
    const { examId, selectedAnswer } = req.body;

    const exam = await validation.validateExamExists(examId);
    validation.validateExamAnswer(exam, selectedAnswer);

    const normalizedSelected = String(selectedAnswer);
    const normalizedCorrect = String(exam.correctAnswer);

    const isCorrect = normalizedSelected === normalizedCorrect;

    // No guardar en base de datos, solo devolver validación para autoevaluación local
    res.json({
      success: true,
      data: {
        examId: Number(examId),
        selectedAnswer: normalizedSelected,
        correctAnswer: normalizedCorrect,
        isCorrect,
        scorePoints: isCorrect ? 100 : 0
      }
    });
  } catch (err) {
    console.error("[validateAnswer]", err);
    if (err.status) {
      return res.status(err.status).json({
        error: err.code,
        message: err.message
      });
    }
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Error al validar respuesta"
    });
  }
};

exports.saveResult = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const { examId, selectedAnswer, timeSpent } = req.body;

    const exam = await validation.validateExamExists(examId);
    validation.validateExamAnswer(exam, selectedAnswer);

    const normalizedSelected = String(selectedAnswer);
    const normalizedCorrect = String(exam.correctAnswer);

    const isCorrect = normalizedSelected === normalizedCorrect;
    const scorePoints = isCorrect ? 100 : 0;

    const result = await prisma.examResult.upsert({
      where: {
        examId_userId: {
          examId: Number(examId),
          userId
        }
      },
      update: {
        selectedAnswer: normalizedSelected,
        isCorrect,
        scorePoints,
        timeSpent: timeSpent ? Number(timeSpent) : null,
        createdAt: new Date()
      },
      create: {
        userId,
        examId: Number(examId),
        selectedAnswer: normalizedSelected,
        isCorrect,
        scorePoints,
        timeSpent: timeSpent ? Number(timeSpent) : null
      }
    });

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error("[saveResult]", err);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Error al guardar resultado"
    });
  }
};

exports.getUserResults = async (req, res) => {
  try {
    const userId = Number(req.user.id);

    const results = await prisma.examResult.findMany({
      where: { userId },
      include: {
        exam: {
          select: {
            id: true,
            question: true,
            difficulty: true,
            lesson: {
              select: { id: true, title: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(results);
  } catch (err) {
    console.error("[getUserResults]", err);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Error al obtener resultados"
    });
  }
};

exports.getExamStatistics = async (req, res) => {
  try {
    const examId = Number(req.params.examId);

    const results = await prisma.examResult.findMany({
      where: { examId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    const totalAttempts = results.length;
    const correctAnswers = results.filter(r => r.isCorrect).length;

    const averageScore = totalAttempts > 0
      ? (correctAnswers / totalAttempts * 100)
      : 0;

    const avgTimeSpent = totalAttempts > 0
      ? Math.round(results.reduce((sum, r) => sum + (r.timeSpent || 0), 0) / totalAttempts)
      : 0;

    res.json({
      examId,
      statistics: {
        totalAttempts,
        correctAnswers,
        incorrectAnswers: totalAttempts - correctAnswers,
        averageScore,
        averageTimeSeconds: avgTimeSpent
      },
      detailed: results
    });
  } catch (err) {
    console.error("[getExamStatistics]", err);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Error al obtener estadísticas"
    });
  }
};

exports.getResultById = async (req, res) => {
  try {
    const resultId = Number(req.params.resultId);

    const result = await prisma.examResult.findUnique({
      where: { id: resultId },
      include: {
        exam: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!result) {
      return res.status(404).json({
        error: "NOT_FOUND"
      });
    }

    if (req.user.id !== result.userId && req.user.role !== "admin") {
      return res.status(403).json({
        error: "UNAUTHORIZED"
      });
    }

    res.json(result);
  } catch (err) {
    console.error("[getResultById]", err);
    res.status(500).json({
      error: "INTERNAL_ERROR"
    });
  }
};