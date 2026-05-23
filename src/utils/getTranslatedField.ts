export type SupportedLanguage = "it" | "en" | "es" | "de" | "fr" | "bg";

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["it", "en", "es", "de", "fr", "bg"];

function normalizeLanguage(language?: string): SupportedLanguage {
  const short = String(language || "it").toLowerCase().split(/[-_]/)[0] as SupportedLanguage;
  return SUPPORTED_LANGUAGES.includes(short) ? short : "it";
}

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

function buildCandidates(baseField: string, language: SupportedLanguage): string[] {
  if (language === "it") {
    return [`${baseField}_it`, baseField];
  }

  return [`${baseField}_${language}`, `${baseField}_it`, baseField];
}

export function getTranslatedField(
  record: Record<string, any> | null | undefined,
  baseField: string,
  language?: string,
  fallback = "-"
): string {
  if (!record || !baseField) return fallback;

  const normalizedLanguage = normalizeLanguage(language);
  const candidates = buildCandidates(baseField, normalizedLanguage);

  for (const key of candidates) {
    const value = record[key];
    if (hasValue(value)) return String(value).trim();
  }

  return fallback;
}
