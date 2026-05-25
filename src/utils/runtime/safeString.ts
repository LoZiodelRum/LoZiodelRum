export type SafeStringOptions = {
  fallback?: string;
  trim?: boolean;
};

export function safeString(value: unknown, options: SafeStringOptions = {}): string {
  const { fallback = "", trim = true } = options;

  if (value === null || value === undefined) {
    return fallback;
  }

  const output = String(value);
  return trim ? output.trim() : output;
}
