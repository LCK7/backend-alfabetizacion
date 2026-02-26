const router = require("express").Router();
const controller = require("../controllers/mlPrediction");

// POST porque enviamos body
router.post("/predict-word", controller.predecirPalabra);

module.exports = router;