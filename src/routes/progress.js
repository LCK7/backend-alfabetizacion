const router = require("express").Router();
const auth = require("../middlewares/auth");
const controller = require("../controllers/progress");

router.post("/complete", auth, controller.completeLesson);
router.get("/my", auth, controller.listMyProgress);

module.exports = router;
