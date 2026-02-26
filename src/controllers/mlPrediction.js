const { predecirComplejidad } = require("../services/mlService");

exports.predecirPalabra = async (req, res) => {
  const { word } = req.body;

  if (!word) {
    return res.status(400).json({ msg: "Debe enviar una palabra" });
  }

  try {
    const complexity = await predecirComplejidad(word);

    if (complexity === null) {
      return res.status(500).json({ msg: "Error en modelo ML" });
    }

    res.json({
      word,
      complexity
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error predicción" });
  }
};