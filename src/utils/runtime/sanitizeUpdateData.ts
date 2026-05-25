export type SanitizeUpdateDataOptions = {
  trimStrings?: boolean;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

export function sanitizeUpdateData<T extends Record<string, any>>(
  input: T,
  options: SanitizeUpdateDataOptions = {}
): Partial<T> {
  const { trimStrings = true } = options;
  const output: Record<string, unknown> = {};

  Object.entries(input || {}).forEach(([key, rawValue]) => {
    let value: unknown = rawValue;

    if (typeof value === "string" && trimStrings) {
      value = value.trim();
    }

    if (value === null || value === undefined || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      output[key] = value;
      return;
    }

    if (isPlainObject(value)) {
      const nested = sanitizeUpdateData(value as Record<string, any>, options);
      if (Object.keys(nested).length > 0) {
        output[key] = nested;
      }
      return;
    }

    output[key] = value;
  });

  return output as Partial<T>;
}
