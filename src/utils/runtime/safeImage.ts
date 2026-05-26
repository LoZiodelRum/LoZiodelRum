const FALLBACK_IMAGE = "/placeholder.webp";

export function safeImage(value: unknown): string {
  if (typeof value !== "string") return FALLBACK_IMAGE;

  const trimmed = value.trim();

  if (!trimmed) return FALLBACK_IMAGE;

  return trimmed;
}
