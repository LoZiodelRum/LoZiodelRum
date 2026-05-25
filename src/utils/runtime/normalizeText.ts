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

  if (value === null || value === undefined) return fallback;

  let output = String(value);

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
