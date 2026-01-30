const { createChatCompletion } = require("../services/openai");

exports.chatBot = async (req, res) => {
  try {
    const { message, temperature, max_tokens } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "'message' is required and must be a string" });
    }

    const systemPrompt =
      "Eres un tutor paciente que enseña tecnología paso a paso a adultos mayores. Responde con instrucciones claras y divididas en pasos cuando sea apropiado, usa lenguaje sencillo y ejemplos prácticos.";

    const payload = {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: typeof temperature === "number" ? temperature : 0.6,
      max_tokens: typeof max_tokens === "number" ? max_tokens : 512,
    };

    const result = await createChatCompletion(payload);

    const reply = result?.choices?.[0]?.message?.content || "";

    return res.json({ reply });
  } catch (err) {
    console.error("AI chat error:", err?.message || err);
    return res.status(500).json({ error: "Error processing AI request" });
  }
};
