export function removeEmptyFields(input: Record<string, any>): Record<string, any> {
  const output: Record<string, any> = {};

  Object.entries(input || {}).forEach(([key, raw]) => {
    const value = typeof raw === "string" ? raw.trim() : raw;

    if (value === null || value === undefined || value === "") return;

    if (Array.isArray(value)) {
      output[key] = value;
      return;
    }

    if (Object.prototype.toString.call(value) === "[object Object]") {
      const nested = removeEmptyFields(value as Record<string, any>);
      if (Object.keys(nested).length > 0) {
        output[key] = nested;
      }
      return;
    }

    output[key] = value;
  });

  return output;
}

export function ensureDoubleConfirmToken(token: unknown): boolean {
  return String(token || "").trim() === "CONFIRM_DELETE";
}
