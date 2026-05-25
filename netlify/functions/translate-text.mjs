const ALLOWED_LANGUAGES = new Set(["es", "bg"]);
const MAX_TEXTS = 12;
const MAX_TEXT_LENGTH = 12000;

async function translateOne(text, targetLang) {
  const endpoint =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=" +
    encodeURIComponent(targetLang) +
    "&dt=t&q=" +
    encodeURIComponent(text);

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Translation API HTTP ${response.status}`);
  }

  const payload = await response.json();
  const translated = Array.isArray(payload?.[0])
    ? payload[0].map((part) => part?.[0] || "").join("")
    : "";

  const normalized = String(translated || "").trim();
  return normalized || text;
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, message: "Method not allowed" }),
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ ok: false, message: "Invalid JSON body" }),
    };
  }

  const targetLang = String(parsed?.targetLang || "").toLowerCase().trim();
  const texts = Array.isArray(parsed?.texts) ? parsed.texts : [];

  if (!ALLOWED_LANGUAGES.has(targetLang)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ ok: false, message: "Unsupported target language" }),
    };
  }

  if (!texts.length || texts.length > MAX_TEXTS) {
    return {
      statusCode: 400,
      body: JSON.stringify({ ok: false, message: "Invalid texts payload" }),
    };
  }

  const normalizedTexts = texts.map((value) => String(value || "").slice(0, MAX_TEXT_LENGTH));

  try {
    const translations = [];

    for (const text of normalizedTexts) {
      if (!text.trim()) {
        translations.push("");
        continue;
      }

      const translated = await translateOne(text, targetLang);
      translations.push(translated);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, translations }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, message: error?.message || "Translation failed" }),
    };
  }
}
