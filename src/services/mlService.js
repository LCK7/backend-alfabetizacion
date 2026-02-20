const axios = require("axios");

const ML_API_URL = "https://ml-api-alfabetizacion.onrender.com/predict"; // URL del modelo ML desplegado

async function predecirAbandono(progreso, diasInactivo, promedioExamen) {
  try {
    const response = await axios.post(ML_API_URL, {
      progreso,
      dias_inactivo: diasInactivo,
      promedio_examen: promedioExamen
    });

    return response.data.probabilidad_abandono;

  } catch (error) {
    console.error("Error ML API completo:");
    console.error(error.response?.data || error.message);
    return null;
    }
}

module.exports = { predecirAbandono };