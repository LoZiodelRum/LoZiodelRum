import { normalizeText } from "./normalizeText";

/*
IMPORTANT:
All translated runtime fields MUST pass through getTranslatedField().

DO NOT:
- access *_en/_bg/_de/_es directly in UI runtime
- create local fallback chains
- duplicate translation resolver logic

Fallback architecture:
IT -> base
EN -> _en -> base
BG -> _bg -> _en -> base
DE -> _de -> _en -> base
ES -> _es -> _en -> base
*/


export type SupportedLanguage = "it" | "en" | "de" | "bg" | "es" | "fr";

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["it", "en", "de", "bg", "es", "fr"];

function normalizeLanguage(language?: string): SupportedLanguage {
  const short = normalizeText(language || "it").split(/[-_]/)[0] as SupportedLanguage;

  return SUPPORTED_LANGUAGES.includes(short) ? short : "it";
}

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}


function buildCandidates(baseField: string, language: SupportedLanguage): string[] {
  if (language === "fr") {
    // SOLO *_fr o campo base, MAI fallback a EN
    return [`${baseField}_fr`, baseField];
  }
  if (language === "it") {
    return [baseField, `${baseField}_it`];
  }
  if (language === "en") {
    return [`${baseField}_en`, baseField];
  }
  if (language === "de") {
    return [`${baseField}_de`, `${baseField}_en`, baseField];
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
  let chosenKey = null;
  let chosenValue = fallback;

  for (const key of candidates) {
    const value = record[key];
    if (hasValue(value)) {
      chosenKey = key;
      chosenValue = String(value).trim();
      break;
    }
  }

  // Log diagnostico
  if (typeof window !== "undefined" && window?.console) {
    // eslint-disable-next-line no-console
    console.log("[getTranslatedField] lingua:", normalizedLanguage, "campo:", baseField, "key usata:", chosenKey, "valore:", chosenValue);
  }

  return chosenValue;
}
