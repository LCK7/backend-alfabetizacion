const axios = require("axios");

const OPENAI_URL = "https://api.openai.com/v1/responses";

async function createChatCompletion({
  messages,
  model = "gpt-4.1-mini",
  temperature = 0.4,
  max_tokens = 200,
}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured in environment");
  }

  const resp = await axios.post(
    OPENAI_URL,
    {
      model,
      input: messages,
      temperature,
      max_output_tokens: max_tokens,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );

  return resp.data;
}

module.exports = { createChatCompletion };
