type TargetLanguage = "es" | "bg";

const TARGET_LANGUAGES: TargetLanguage[] = ["es", "bg"];
const memoryCache = new Map<string, string>();

function normalizeLanguage(language?: string): TargetLanguage | null {
  const short = String(language || "").toLowerCase().split(/[-_]/)[0] as TargetLanguage;
  return TARGET_LANGUAGES.includes(short) ? short : null;
}

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

function sourceFieldOrder(baseField: string): string[] {
  return [`${baseField}_it`, baseField, `${baseField}_en`];
}

function pickSourceText(record: Record<string, any>, baseField: string): string {
  for (const key of sourceFieldOrder(baseField)) {
    const value = record?.[key];
    if (hasValue(value)) return String(value).trim();
  }
  return "";
}

function hashString(value: string): string {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

function storageKey(targetLang: TargetLanguage, text: string): string {
  return `dw:autotranslate:v1:${targetLang}:${hashString(text)}`;
}

function getCachedTranslation(targetLang: TargetLanguage, text: string): string | null {
  const key = storageKey(targetLang, text);

  if (memoryCache.has(key)) {
    return memoryCache.get(key) || null;
  }

  try {
    const fromStorage = localStorage.getItem(key);
    if (fromStorage && fromStorage.trim()) {
      memoryCache.set(key, fromStorage);
      return fromStorage;
    }
  } catch {
    // Ignore storage access errors.
  }

  return null;
}

function setCachedTranslation(targetLang: TargetLanguage, text: string, translated: string) {
  const key = storageKey(targetLang, text);
  memoryCache.set(key, translated);

  try {
    localStorage.setItem(key, translated);
  } catch {
    // Ignore storage write errors.
  }
}

async function requestTranslation(texts: string[], targetLang: TargetLanguage): Promise<string[]> {
  const endpoints = ["/api/translate-text", "/.netlify/functions/translate-text"];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts, targetLang }),
      });

      if (!response.ok) continue;

      const payload = await response.json().catch(() => ({}));
      if (!payload?.ok || !Array.isArray(payload?.translations)) continue;

      return payload.translations.map((value: unknown, index: number) => {
        if (typeof value === "string" && value.trim()) return value.trim();
        return texts[index] || "";
      });
    } catch {
      // Try next endpoint.
    }
  }

  return texts;
}

export async function buildArticleLanguagePatch(
  record: Record<string, any> | null | undefined,
  language?: string,
  fields: string[] = []
): Promise<Record<string, string> | null> {
  if (!record) return null;

  const targetLang = normalizeLanguage(language);
  if (!targetLang) return null;

  const pending: Array<{ field: string; source: string }> = [];
  const patch: Record<string, string> = {};

  for (const field of fields) {
    const translatedField = `${field}_${targetLang}`;
    if (hasValue(record?.[translatedField])) continue;

    const source = pickSourceText(record, field);
    if (!source) continue;

    const cached = getCachedTranslation(targetLang, source);
    if (cached && cached.trim()) {
      patch[translatedField] = cached.trim();
      continue;
    }

    pending.push({ field, source });
  }

  if (pending.length > 0) {
    const translations = await requestTranslation(
      pending.map((entry) => entry.source),
      targetLang
    );

    pending.forEach((entry, index) => {
      const translated = String(translations[index] || entry.source).trim();
      if (!translated) return;
      const translatedField = `${entry.field}_${targetLang}`;
      patch[translatedField] = translated;
      setCachedTranslation(targetLang, entry.source, translated);
    });
  }

  return Object.keys(patch).length > 0 ? patch : null;
}
