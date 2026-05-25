type ApiRequest = {
  method?: string;
  body?: any;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (payload: any) => void;
};

const ALLOWED_LANGUAGES = new Set(["es", "bg"]);
const MAX_TEXTS = 12;
const MAX_TEXT_LENGTH = 12000;

async function translateOne(text: string, targetLang: string): Promise<string> {
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
    ? payload[0].map((part: any) => part?.[0] || "").join("")
    : "";

  const normalized = String(translated || "").trim();
  return normalized || text;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const targetLang = String(req.body?.targetLang || "").toLowerCase().trim();
  const texts = Array.isArray(req.body?.texts) ? req.body.texts : [];

  if (!ALLOWED_LANGUAGES.has(targetLang)) {
    return res.status(400).json({ ok: false, message: "Unsupported target language" });
  }

  if (!texts.length || texts.length > MAX_TEXTS) {
    return res.status(400).json({ ok: false, message: "Invalid texts payload" });
  }

  const normalizedTexts = texts.map((value) => String(value || "").slice(0, MAX_TEXT_LENGTH));

  try {
    const translations: string[] = [];

    for (const text of normalizedTexts) {
      if (!text.trim()) {
        translations.push("");
        continue;
      }

      const translated = await translateOne(text, targetLang);
      translations.push(translated);
    }

    return res.status(200).json({ ok: true, translations });
  } catch (error: any) {
    return res.status(500).json({ ok: false, message: error?.message || "Translation failed" });
  }
}
