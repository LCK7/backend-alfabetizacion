const { createChatCompletion } = require("../services/openai");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const userUsage = new Map();
const DAILY_LIMIT = 100;

async function getCoursesData() {
  return prisma.course.findMany({
    select: {
      title: true,
      description: true,
      lessons: {
        select: {
          title: true,
          content: true
        }
      }
    }
  });
}

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

    const courses = await getCoursesData();
    const coursesText = courses.map(c => {
      const lessons = c.lessons.map(l => `- ${l.title}: ${l.content}`).join("\n");
      return `Curso: ${c.title}\nDescripción: ${c.description || 'Sin descripción'}\nLecciones:\n${lessons}`;
    }).join("\n\n");

    const systemPrompt = `
Eres un tutor digital para adultos mayores.
Reglas obligatorias:
- Explica en lenguaje muy simple
- Usa pasos numerados, máximo 5
- Frases cortas
- Si el usuario no entiende, explica diferente
- Nunca des respuestas largas
- Siempre guía paso a paso

Los cursos disponibles actualmente son:

${coursesText}

Responde a las preguntas del usuario y recomienda cursos y lecciones relevantes según la pregunta. 
Solo menciona cursos y lecciones que existan.
`;

    const messagesForAI = [
      { role: "system", content: systemPrompt },
      ...(Array.isArray(history) ? history : []),
      { role: "user", content: message }
    ];

    const result = await createChatCompletion({
      messages: messagesForAI,
      temperature: typeof temperature === "number" ? temperature : 0.4,
      max_tokens: typeof max_tokens === "number" ? max_tokens : 200,
      model: "gpt-4.1-mini"
    });

    const reply = result?.output?.[0]?.content?.[0]?.text || "No se pudo generar respuesta.";
    return res.json({ reply });

  } catch (err) {
    console.error("AI chat error:", err.response?.data || err.message || err);
    return res.status(500).json({ error: "Error processing AI request" });
  }
};
