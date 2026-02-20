const router = require("express").Router();
const controller = require("../controllers/mlPrediction");

router.get("/predict/:userId", controller.predecirUsuario);
router.get("/predict-all", controller.predecirTodosUsuarios);

module.exports = router;