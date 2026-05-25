export type SafeArrayOptions = {
  filterNullish?: boolean;
};

export function safeArray<T>(value: unknown, options: SafeArrayOptions = {}): T[] {
  const { filterNullish = false } = options;
  if (!Array.isArray(value)) return [];

  if (!filterNullish) {
    return value as T[];
  }

  return (value as Array<T | null | undefined>).filter(
    (item): item is T => item !== null && item !== undefined
  );
}
