const router = require("express").Router();
const controller = require("../controllers/course");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");

router.get("/", controller.getCourses);
router.get("/:id", controller.getCourseById);

// Rutas protegidas solo para admin
router.post("/", auth, role("admin"), controller.createCourse);
router.put("/:id", auth, role("admin"), controller.updateCourse);
router.delete("/:id", auth, role("admin"), controller.deleteCourse);

module.exports = router;
