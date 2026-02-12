const router = require("express").Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const controller = require("../controllers/exam");

// listar examenes por curso
router.get("/course/:courseId", controller.listByCourse);
// listar examenes por lección
router.get("/lesson/:lessonId", controller.listByLesson);

// crear examen (admin)
router.post("/", auth, role("admin"), controller.createExam);
// crear múltiples preguntas en batch (admin)
router.post("/batch", auth, role("admin"), controller.createExams);

module.exports = router;
