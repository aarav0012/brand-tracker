const axios = require("axios");
const { franc } = require("franc-min");

const detectLanguage = (text) => {
  const detected = franc(text);
  const map = {
    eng: "en",
    spa: "es",
    fra: "fr",
    deu: "de",
    hin: "hi",
    por: "pt",
    rus: "ru",
    jpn: "ja",
    kor: "ko",
    ara: "ar",
    und: "en",
  };
  return map[detected] || "en";
};

const translateToEnglish = async (text) => {
  const lang = detectLanguage(text);

  if (lang === "en") {
    return {
      translatedText: text,
      originalLanguage: "en",
      wasTranslated: false,
    };
  }

  try {
    const res = await axios.post("https://libretranslate.de/translate", {
      q: text,
      source: lang,
      target: "en",
      format: "text",
    });

    return {
      translatedText: res.data.translatedText,
      originalLanguage: lang,
      wasTranslated: true,
    };
  } catch (err) {
    console.error("LibreTranslate Error:", err.message);
    return {
      translatedText: text,
      originalLanguage: lang,
      wasTranslated: false,
    };
  }
};

const translateBatch = async (texts) => {
  return Promise.all(texts.map((t) => translateToEnglish(t)));
};

module.exports = {
  detectLanguage,
  translateToEnglish,
  translateBatch,
};
