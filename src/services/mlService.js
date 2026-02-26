const axios = require("axios");
const ML_API_URL = "https://ml-api-alfabetizacion.onrender.com";

async function predecirComplejidadPalabra(word) {
  try {
    const response = await axios.post(ML_API_URL, { word });
    return response.data.complexity || 0;
  } catch (error) {
    console.error("Error ML API:", error.response?.data || error.message);
    return 0;
  }
}

// Función para evaluar un texto completo
async function predecirComplejidadTexto(text) {
  const words = text.split(/\s+/).filter(Boolean);
  const results = await Promise.all(words.map(predecirComplejidadPalabra));
  const avg = results.reduce((a, b) => a + b, 0) / (results.length || 1);
  return avg;
}

module.exports = { predecirComplejidadPalabra, predecirComplejidadTexto };