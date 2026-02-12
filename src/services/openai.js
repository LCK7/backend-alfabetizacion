const axios = require("axios");

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

async function createChatCompletion({ messages, model = "gpt-4o-mini", temperature = 0.4, max_tokens = 170 }) {
  if (!process.env.OPENAI_KEY) {
    throw new Error("OPENAI_KEY not configured in environment");
  }

  const resp = await axios.post(
    OPENAI_URL,
    {
      model,
      messages,
      temperature,
      max_tokens,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 30_000,
    }
  );

  return resp.data;
}

module.exports = { createChatCompletion };
