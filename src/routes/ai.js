const router = require("express").Router();
const controller = require("../controllers/ai");

router.post("/chat", controller.chatBot);
router.post("/simplify", controller.simplifyLesson);

module.exports = router;
