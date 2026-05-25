import { normalizeText } from "./normalizeText";

export type SupportedLanguage = "it" | "en" | "es" | "bg";

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["it", "en", "es", "bg"];

function normalizeLanguage(language?: string): SupportedLanguage {
  const short = normalizeText(language || "it", {
    trim: true,
    lowercase: true,
    collapseWhitespace: false,
    removeDiacritics: false,
    fallback: "it",
  }).split(/[-_]/)[0] as SupportedLanguage;

  return SUPPORTED_LANGUAGES.includes(short) ? short : "it";
}

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

function buildCandidates(baseField: string, language: SupportedLanguage): string[] {
  if (language === "it") {
    return [baseField, `${baseField}_it`];
  }

  if (language === "en") {
    return [`${baseField}_en`, baseField];
  }

  if (language === "es") {
    return [`${baseField}_es`, `${baseField}_en`, baseField, `${baseField}_it`];
  }

  if (language === "bg") {
    return [`${baseField}_bg`, `${baseField}_en`, baseField];
  }

  return [baseField, `${baseField}_it`];
}

export function getTranslatedField(
  record: Record<string, any> | null | undefined,
  baseField: string,
  language?: string,
  fallback = ""
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
