export function safeNumber(
  value: unknown,
  fallback = 0
): number {
  const parsed = Number(value);
  
  if (Number.isNaN(parsed)) return fallback;

  return parsed;
}
