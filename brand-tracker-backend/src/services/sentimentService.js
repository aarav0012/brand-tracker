const axios = require("axios");
const config = require("../config/config");

// Free sentiment model — works on HF Inference API
const HF_MODEL = "cardiffnlp/twitter-roberta-base-sentiment-latest";

// Correct updated HuggingFace endpoint
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`;

const analyzeSentiment = async (text) => {
  try {
    if (!text || !text.trim()) return "neutral";

    if (!config.huggingFaceApiKey) {
      console.warn("HuggingFace key missing → fallback mode");
      return basicSentiment(text);
    }

    const response = await axios.post(
      HF_API_URL,
      {
        inputs: text.slice(0, 300), // safe limit
      },
      {
        headers: {
          Authorization: `Bearer ${config.huggingFaceApiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const results = response.data;

    // Check result format
    if (!Array.isArray(results) || !Array.isArray(results[0])) {
      console.error("Unexpected HF format:", results);
      return basicSentiment(text);
    }

    // Get the highest score label
    const best = results[0].sort((a, b) => b.score - a.score)[0];
    const label = best.label.toLowerCase();

    if (label.includes("positive")) return "positive";
    if (label.includes("negative")) return "negative";
    return "neutral";

  } catch (error) {
    console.error("HuggingFace Sentiment Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    return basicSentiment(text);
  }
};


// fallback: simple word scoring
const basicSentiment = (text) => {
  const t = text.toLowerCase();
  let score = 0;

  const pos = ["good", "great", "love", "excellent", "nice", "amazing"];
  const neg = ["bad", "terrible", "hate", "awful", "worst"];

  pos.forEach((w) => t.includes(w) && score++);
  neg.forEach((w) => t.includes(w) && score--);

  return score > 0 ? "positive" : score < 0 ? "negative" : "neutral";
};

module.exports = { analyzeSentiment };
