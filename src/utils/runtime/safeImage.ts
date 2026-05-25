import { safeString } from "./safeString";

export type SafeImageOptions = {
  fallback?: string;
};

export function safeImage(value: unknown, options: SafeImageOptions = {}): string {
  const { fallback = "" } = options;
  const raw = safeString(value, { fallback: "", trim: true });

  if (!raw) return fallback;
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:") || raw.startsWith("blob:") || raw.startsWith("/")) {
    return raw;
  }

  if (raw.startsWith("//")) {
    return `https:${raw}`;
  }

  if (raw.startsWith("www.")) {
    return `https://${raw}`;
  }

  return raw;
}
