const router = require("express").Router();
const auth = require("../middlewares/auth");
const controller = require("../controllers/examResult");

router.post("/", auth, controller.saveResult);

module.exports = router;