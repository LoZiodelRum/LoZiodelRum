import { normalizeText } from "./normalizeText";

export type SlugifySafeOptions = {
  fallback?: string;
};

export function slugifySafe(value: unknown, options: SlugifySafeOptions = {}): string {
  const { fallback = "n-a" } = options;

  const normalized = normalizeText(value, {
    trim: true,
    lowercase: true,
    collapseWhitespace: true,
    removeDiacritics: true,
    fallback: "",
  });

  const slug = normalized
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug || fallback;
}
