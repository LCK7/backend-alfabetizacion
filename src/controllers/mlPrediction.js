const prisma = require("../prisma");
const { predecirAbandono } = require("../services/mlService");

exports.predecirUsuario = async (req, res) => {
  const userId = Number(req.params.userId);

  try {

    const totalLessons = await prisma.lesson.count();

    const completadas = await prisma.progress.count({
      where: {
        userId,
        completed: true
      }
    });

    const progreso = totalLessons === 0 ? 0 : completadas / totalLessons;

    const ultimaActividad = await prisma.progress.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    let diasInactivo = 30;

    if (ultimaActividad) {
      const hoy = new Date();
      const diff = hoy - ultimaActividad.createdAt;
      diasInactivo = Math.floor(diff / (1000 * 60 * 60 * 24));
    }
    const resultados = await prisma.examResult.findMany({
        where: { userId }
    });

    let promedioExamen = 0;

    if (resultados.length > 0) {
        const suma = resultados.reduce((acc, r) => acc + r.score, 0);
        promedioExamen = suma / resultados.length;
    }

    const probabilidad = await predecirAbandono(
      progreso,
      diasInactivo,
      promedioExamen
    );

    res.json({
      userId,
      progreso,
      diasInactivo,
      promedioExamen,
      probabilidadAbandono: probabilidad
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error predicción" });
  }
};

exports.predecirTodosUsuarios = async (req, res) => {
  try {

    const users = await prisma.user.findMany();

    const resultados = [];

    for (const user of users) {

      const totalLessons = await prisma.lesson.count();

      const completadas = await prisma.progress.count({
        where: { userId: user.id, completed: true }
      });

      const progreso = totalLessons === 0 ? 0 : completadas / totalLessons;

      const ultimaActividad = await prisma.progress.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" }
      });

      let diasInactivo = 30;

      if (ultimaActividad) {
        const diff = new Date() - ultimaActividad.createdAt;
        diasInactivo = Math.floor(diff / (1000 * 60 * 60 * 24));
      }

      const examenes = await prisma.examResult.findMany({
        where: { userId: user.id }
      });

      let promedioExamen = 0;

      if (examenes.length > 0) {
        const suma = examenes.reduce((acc, r) => acc + r.score, 0);
        promedioExamen = suma / examenes.length;
      }

      const prob = await predecirAbandono(
        progreso,
        diasInactivo,
        promedioExamen
      );

      resultados.push({
        userId: user.id,
        name: user.name,
        progreso,
        diasInactivo,
        promedioExamen,
        probabilidadAbandono: prob
      });
    }

    res.json(resultados);

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error predicción masiva" });
  }
};