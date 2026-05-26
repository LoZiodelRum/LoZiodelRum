export function sanitizeUpdateData<T extends Record<string, any>>(
  data: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([_, value]) => {
      if (value === null) return false;
      if (value === undefined) return false;

      if (typeof value === "string" && value.trim() === "") {
        return false;
      }

      return true;
    })
  ) as Partial<T>;
}
