import { sanitizeUpdateData } from "./runtime/sanitizeUpdateData";

export type RemoveEmptyOptions = {
  trimStrings?: boolean;
};

export function removeEmptyFields<T extends Record<string, any>>(
  input: T,
  options: RemoveEmptyOptions = {}
): Partial<T> {
  void options;
  return sanitizeUpdateData(input);
}
