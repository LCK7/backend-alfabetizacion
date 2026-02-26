const router = require("express").Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const controller = require("../controllers/examResult");

// Validar respuesta de examen (autoevaluación local)
router.post("/validate", auth, controller.validateAnswer);

// Obtener resultados del usuario actual
router.get("/my-results", auth, controller.getUserResults);

// Obtener resultado específico
router.get("/:resultId", auth, controller.getResultById);

// Estadísticas de un examen (solo admin)
router.get("/stats/:examId", auth, role("admin"), controller.getExamStatistics);

module.exports = router;