export type SafeNumberOptions = {
  fallback?: number;
  min?: number;
  max?: number;
};

export function safeNumber(value: unknown, options: SafeNumberOptions = {}): number {
  const { fallback = 0, min, max } = options;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  let output = parsed;

  if (typeof min === "number") {
    output = Math.max(min, output);
  }

  if (typeof max === "number") {
    output = Math.min(max, output);
  }

  return output;
}
