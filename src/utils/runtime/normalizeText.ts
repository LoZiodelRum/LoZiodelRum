import { safeString } from "./safeString";

export type NormalizeTextOptions = {
  trim?: boolean;
  lowercase?: boolean;
  collapseWhitespace?: boolean;
  removeDiacritics?: boolean;
  fallback?: string;
};

export function normalizeText(value: unknown, options: NormalizeTextOptions = {}): string {
  const {
    trim = true,
    lowercase = true,
    collapseWhitespace = false,
    removeDiacritics = false,
    fallback = "",
  } = options;

  let output = safeString(value, { fallback, trim: false });

  if (removeDiacritics) {
    output = output.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  if (collapseWhitespace) {
    output = output.replace(/\s+/g, " ");
  }

  if (trim) {
    output = output.trim();
  }

  if (lowercase) {
    output = output.toLowerCase();
  }

  return output || fallback;
}
