const router = require("express").Router();
const controller = require("../controllers/ai");

router.post("/chat", controller.chatBot);

module.exports = router;
