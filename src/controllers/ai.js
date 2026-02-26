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


Ayuda a los usuarios con mensajes de ayuda siempre con mensajes breves que motivan
y que le puedan quitar el miedo a usar la tecnología.
Responde a las preguntas del usuario y siempre si hay un curso
contenido en la plataforma recomienda cursos y lecciones relevantes según la pregunta. 
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

exports.simplifyLesson = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!content || !title) {
      return res.status(400).json({
        error: "title and content are required"
      });
    }

    // Sistema para simplificar contenido
    const simplifyPrompt = `
Eres un experto en alfabetización digital para adultos mayores (50 a 65 años).

Reglas obligatorias:
- Usa lenguaje claro pero no sobre-simplifiques
- Incluye emojis relevantes para hacer el contenido más atractivo 📚💡
- Mantén el contenido educativo valioso
- Usa frases de longitud moderada
- Organiza el contenido con estructura clara usando viñetas (-)
- Incluye ejemplos prácticos cuando sea posible y no simplifiques tanto
- No elimines información importante, solo mejora la presentación
- Usa el siguiente formato exacto:
  * Título con emojis al inicio
  * Saltos de línea dobles entre secciones
  * Viñetas (-) para listas
  * Subtítulos con ### y emojis
  * Separadores --- entre secciones principales
  * Resumen final al final
- Devuelve el contenido directamente, sin markdown ni HTML
`;

    const simplifyMessages = [
      { role: "system", content: simplifyPrompt },
      {
        role: "user",
        content: `
Título de la lección: ${title}

Texto original:
${content}

Mejora este texto para hacerlo más legible y comprensible para adultos mayores, incluyendo emojis y mejor formato.
`
      }
    ];

    // Sistema para analizar dificultad
    const difficultyPrompt = `
Eres un experto en análisis de contenido educativo para adultos mayores (50-65 años).

Analiza el siguiente texto y devuelve ÚNICAMENTE un JSON puro con esta estructura, sin formato markdown, sin backticks, sin texto adicional:
{
  "dificultad_tecnica": número del 0 al 100,
  "dificultad_comprension": número del 0 al 100,
  "razonamiento": "breve explicación de los porcentajes"
}

Criterios:
- dificultad_tecnica: complejidad de términos técnicos, comandos, interfaces
- dificultad_comprension: claridad del lenguaje, longitud de frases, estructura lógica
- 0-30: Muy fácil
- 31-60: Moderado  
- 61-100: Difícil

IMPORTANTE: Responde solo con el JSON, sin backticks al inicio ni al final.
`;

    const difficultyMessages = [
      { role: "system", content: difficultyPrompt },
      {
        role: "user",
        content: `
Título: ${title}
Contenido: ${content}
`
      }
    ];

    // Ejecutar ambas llamadas a la IA en paralelo
    const [simplifyResult, difficultyResult] = await Promise.all([
      createChatCompletion({
        messages: simplifyMessages,
        temperature: 0.4,
        max_tokens: 600,
        model: "gpt-4.1-mini"
      }),
      createChatCompletion({
        messages: difficultyMessages,
        temperature: 0.2,
        max_tokens: 150,
        model: "gpt-4.1-mini"
      })
    ]);

    const suggestion = simplifyResult?.output?.[0]?.content?.[0]?.text || "No se pudo generar sugerencia.";
    
    let difficultyAnalysis = {
      dificultad_tecnica: 50,
      dificultad_comprension: 50,
      razonamiento: "Análisis no disponible"
    };

    try {
      const difficultyText = difficultyResult?.output?.[0]?.content?.[0]?.text || "{}";
      
      // Limpiar el texto para eliminar formato markdown si existe
      const cleanJsonText = difficultyText
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .trim();
      
      difficultyAnalysis = JSON.parse(cleanJsonText);
    } catch (parseError) {
      console.warn("Error parsing difficulty analysis:", parseError.message);
      console.warn("Raw difficulty text:", difficultyResult?.output?.[0]?.content?.[0]?.text);
    }

    return res.json({ 
      suggestion,
      difficulty: difficultyAnalysis
    });

  } catch (err) {
    console.error("Simplify error:", err.message);
    return res.status(500).json({ error: "Error simplifying lesson" });
  }
};
