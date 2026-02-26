const router = require("express").Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const examController = require("../controllers/exam");
const examResultController = require("../controllers/examResult");

/**
 * RUTAS PÚBLICAS (obtener exámenes para resolver)
 */
router.get("/lesson/:lessonId", examController.listByLesson);
router.get("/course/:courseId", examController.listByCourse);
router.get("/:examId", examController.getExamById);

/**
 * RUTAS PROTEGIDAS - ESTUDIANTES
 */
router.post("/results", auth, examResultController.saveResult);
router.get("/results/user/:userId", auth, examResultController.getUserResults);

/**
 * RUTAS PROTEGIDAS - ADMIN (crear, editar, eliminar exámenes)
 */
router.post("/", auth, role("admin"), examController.createExam);
router.post("/batch/create", auth, role("admin"), examController.createExamsBatch);
router.put("/:examId", auth, role("admin"), examController.updateExam);
router.delete("/:examId", auth, role("admin"), examController.deleteExam);

/**
 * RUTAS PROTEGIDAS - ADMIN (estadísticas)
 */
router.get("/stats/:examId", auth, role("admin"), examResultController.getExamStatistics);
router.get("/result/:resultId", auth, examResultController.getResultById);

module.exports = router;