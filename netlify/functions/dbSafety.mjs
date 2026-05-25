export function removeEmptyFields(input) {
  const output = {};

  Object.entries(input || {}).forEach(([key, raw]) => {
    const value = typeof raw === "string" ? raw.trim() : raw;

    if (value === null || value === undefined || value === "") return;

    if (Array.isArray(value)) {
      output[key] = value;
      return;
    }

    if (Object.prototype.toString.call(value) === "[object Object]") {
      const nested = removeEmptyFields(value);
      if (Object.keys(nested).length > 0) {
        output[key] = nested;
      }
      return;
    }

    output[key] = value;
  });

  return output;
}

export function ensureDoubleConfirmToken(token) {
  return String(token || "").trim() === "CONFIRM_DELETE";
}
