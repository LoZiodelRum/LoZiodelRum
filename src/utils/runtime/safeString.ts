export function safeString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}
