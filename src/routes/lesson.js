const router = require("express").Router();
const controller = require("../controllers/lesson");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");

// Rutas públicas
router.get("/", controller.getLessons);
router.get("/:id", controller.getLessonById);

// Rutas protegidas solo para admin
router.post("/", auth, role("admin"), controller.createLesson);
router.put("/:id", auth, role("admin"), controller.updateLesson);
router.delete("/:id", auth, role("admin"), controller.deleteLesson);

module.exports = router;
