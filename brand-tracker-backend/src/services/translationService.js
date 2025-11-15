const axios = require("axios");
const { franc } = require("franc-min");

/* ------------------------------------------------------------------
   SAFE LANGUAGE DETECTION
------------------------------------------------------------------ */
const detectLanguage = (text) => {
  if (!text || text.trim().length < 3) return "en"; // fallback

  const detected = franc(text, { minLength: 3 });

  const map = {
    eng: "en",
    fra: "fr",
    spa: "es",
    deu: "de",
    ita: "it",
    por: "pt",
    rus: "ru",
    jpn: "ja",
    kor: "ko",
    zho: "zh",
    ara: "ar",
    hin: "hi",
    und: "en"
  };

  return map[detected] || "en";
};

/* ------------------------------------------------------------------
   FREE TRANSLATION API (MyMemory)
------------------------------------------------------------------ */
const freeTranslateAPI = async (text, from, to = "en") => {
  try {
    const url = "https://api.mymemory.translated.net/get";

    const response = await axios.get(url, {
      params: {
        q: text,
        langpair: `${from}|${to}`
      }
    });

    return response.data?.responseData?.translatedText || text;
  } catch (err) {
    console.error("MyMemory translation failed:", err.message);
    return text;
  }
};

/* ------------------------------------------------------------------
   SIMPLE FALLBACK TRANSLATOR (offline)
------------------------------------------------------------------ */
const simpleFallback = (text) => text; // safe fallback, no modification

/* ------------------------------------------------------------------
   TRANSLATE SINGLE TEXT
------------------------------------------------------------------ */
const translateToEnglish = async (text) => {
  try {
    if (!text) {
      return { translatedText: "", originalLanguage: "unknown", wasTranslated: false };
    }

    const lang = detectLanguage(text);

    if (lang === "en") {
      return { translatedText: text, originalLanguage: "en", wasTranslated: false };
    }

    // Try free API first
    const translated = await freeTranslateAPI(text, lang, "en");

    return {
      translatedText: translated,
      originalLanguage: lang,
      wasTranslated: translated !== text
    };

  } catch (error) {
    console.error("Translation Error:", error.message);

    return {
      translatedText: simpleFallback(text),
      originalLanguage: "unknown",
      wasTranslated: false
    };
  }
};

/* ------------------------------------------------------------------
   BATCH TRANSLATION (SAFE)
------------------------------------------------------------------ */
const translateBatch = async (texts) => {
  const results = [];
  for (const t of texts) {
    const result = await translateToEnglish(t);
    results.push(result);
  }
  return results;
};

module.exports = {
  detectLanguage,
  translateToEnglish,
  translateBatch
};
