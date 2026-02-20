const router = require("express").Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const controller = require("../controllers/exam");

router.get("/course/:courseId", controller.listByCourse);
router.get("/lesson/:lessonId", controller.listByLesson);

router.post("/", auth, role("admin"), controller.createExam);
router.post("/batch", auth, role("admin"), controller.createExams);

module.exports = router;