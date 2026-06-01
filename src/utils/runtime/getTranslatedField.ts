import { normalizeText } from "./normalizeText";

/*
IMPORTANT:
All translated runtime fields MUST pass through getTranslatedField().

Fallback architecture:
selected language -> Italian base -> first available translated value
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
  const selected = language === "it" ? [baseField, `${baseField}_it`] : [`${baseField}_${language}`];
  const italian = [baseField, `${baseField}_it`];
  const available = [
    `${baseField}_en`,
    `${baseField}_de`,
    `${baseField}_es`,
    `${baseField}_bg`,
    `${baseField}_fr`,
  ];

  return Array.from(new Set([...selected, ...italian, ...available]));
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
  let chosenValue = fallback;

  for (const key of candidates) {
    const value = record[key];
    if (hasValue(value)) {
      chosenValue = String(value).trim();
      break;
    }
  }

  return chosenValue;
}
