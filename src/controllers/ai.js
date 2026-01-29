const axios = require("axios");

exports.chatBot = async (req, res) => {
  const { message } = req.body;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres un tutor paciente que enseña tecnología paso a paso a adultos mayores.",
        },
        { role: "user", content: message },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_KEY}`,
      },
    }
  );

  res.json(response.data.choices[0].message.content);
};
