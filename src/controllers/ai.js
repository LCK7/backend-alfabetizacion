const { createChatCompletion } = require("../services/openai");

const userUsage = new Map();
const DAILY_LIMIT = 30;

setInterval(() => {
  userUsage.clear();
}, 24 * 60 * 60 * 1000);

exports.chatBot = async (req, res) => {
  try {
    const ip = req.ip;
    const used = userUsage.get(ip) || 0;

    if (used >= DAILY_LIMIT) {
      return res.json({
        reply: "Has alcanzado el límite diario de mensajes. Intenta mañana."
      });
    } 

    userUsage.set(ip, used + 1);

    const { message, history, temperature, max_tokens } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "'message' is required and must be a string"
      });
    }

    const systemPrompt = `
    Eres un tutor digital para adultos mayores.

    Reglas obligatorias:
    - Explica en lenguaje muy simple
    - Usa pasos numerados
    - Máximo 5 pasos
    - Frases cortas
    - Si el usuario no entiende, explica diferente
    - Nunca des respuestas largas
    - Siempre guía paso a paso
    `;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(Array.isArray(history) ? history : []),
      { role: "user", content: message }
    ];

    const result = await createChatCompletion({
      messages,
      temperature: typeof temperature === "number" ? temperature : 0.4,
      max_tokens: typeof max_tokens === "number" ? max_tokens : 200,
      model: "gpt-4.1-mini"
    });

    const reply = result?.choices?.[0]?.message?.content || "";

    return res.json({ reply });

  } catch (err) {
    if (err.response) {
      console.error("OpenAI API error:", err.response.data);
    } else {
      console.error("AI chat error:", err.message || err);
    }

    return res.status(500).json({
      error: "Error processing AI request"
    });
  }
};
