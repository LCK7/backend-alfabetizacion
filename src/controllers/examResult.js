const prisma = require("../prisma");

exports.saveResult = async (req, res) => {
  try {
    const userId = req.user.id;
    const { examId, score } = req.body;

    const result = await prisma.examResult.create({
      data: {
        userId,
        examId: Number(examId),
        score: Number(score)
      }
    });

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error guardando resultado" });
  }
};