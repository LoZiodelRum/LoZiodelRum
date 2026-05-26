export function safeArray<T>(value: unknown): T[] {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean) as T[];
}
