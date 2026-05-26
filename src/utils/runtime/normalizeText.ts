import { safeString } from "./safeString";

export function normalizeText(value: unknown): string {
  return safeString(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
