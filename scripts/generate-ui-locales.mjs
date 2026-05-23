#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const ROOT = resolve("/Users/mauriziograci/loziodelrum-app");
const TARGET_LANGS = ["es", "fr", "de", "bg"];

const FILES = [
  ["src/i18n/locales/en/translation.json", "src/i18n/locales"],
  ["src/locales/en/navbar.json", "src/locales"],
  ["src/locales/en/home.json", "src/locales"],
  ["src/locales/en/community.json", "src/locales"],
  ["src/locales/en/drink.json", "src/locales"],
  ["src/locales/en/common.json", "src/locales"],
];

const NAVBAR_OVERRIDES = {
  shortIt: "🇮🇹 IT",
  shortEn: "🇬🇧 EN",
  shortEs: "🇪🇸 ES",
  shortFr: "🇫🇷 FR",
  shortDe: "🇩🇪 DE",
  shortBg: "🇧🇬 BG",
  codeIt: "IT",
  codeEn: "EN",
  codeEs: "ES",
  codeFr: "FR",
  codeDe: "DE",
  codeBg: "BG",
  it: "🇮🇹 IT",
  en: "🇬🇧 EN",
  es: "🇪🇸 ES",
  fr: "🇫🇷 FR",
  de: "🇩🇪 DE",
  bg: "🇧🇬 BG",
};

function hasValue(value) {
  return typeof value === "string" ? value.trim().length > 0 : value !== null && value !== undefined;
}

function preservePlaceholders(text) {
  const tokens = [];
  const protectedText = String(text).replace(/\{\{[^}]+\}\}/g, (match) => {
    const token = `__PH_${tokens.length}__`;
    tokens.push([token, match]);
    return token;
  });
  return { protectedText, tokens };
}

function restorePlaceholders(text, tokens) {
  return tokens.reduce((acc, [token, original]) => acc.replaceAll(token, original), text);
}

const cache = new Map();
async function translateText(text, targetLang) {
  const input = String(text);
  if (!hasValue(input)) return input;
  const cacheKey = `${targetLang}::${input}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const { protectedText, tokens } = preservePlaceholders(input);
  const endpoint =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=" +
    encodeURIComponent(targetLang) +
    "&dt=t&q=" +
    encodeURIComponent(protectedText);

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Translation API error: HTTP ${response.status}`);
  }

  const payload = await response.json();
  const translated = Array.isArray(payload?.[0])
    ? payload[0].map((part) => part?.[0] || "").join("")
    : "";

  const restored = restorePlaceholders(translated.trim() || input, tokens);
  cache.set(cacheKey, restored);
  return restored;
}

async function translateValue(value, targetLang) {
  if (Array.isArray(value)) {
    const result = [];
    for (const item of value) {
      result.push(await translateValue(item, targetLang));
    }
    return result;
  }

  if (value && typeof value === "object") {
    const result = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      result[key] = await translateValue(nestedValue, targetLang);
    }
    return result;
  }

  if (typeof value === "string") {
    return translateText(value, targetLang);
  }

  return value;
}

async function main() {
  for (const targetLang of TARGET_LANGS) {
    for (const [sourcePath, rootFolder] of FILES) {
      const raw = await readFile(resolve(ROOT, sourcePath), "utf8");
      const json = JSON.parse(raw);
      const translated = await translateValue(json, targetLang);

      if (sourcePath.includes("navbar.json")) {
        translated.language = { ...NAVBAR_OVERRIDES };
      }

      const outPath = resolve(ROOT, sourcePath.replace("/en/", `/${targetLang}/`));
      await mkdir(dirname(outPath), { recursive: true });
      await writeFile(outPath, JSON.stringify(translated, null, 2) + "\n", "utf8");
      console.log(`Wrote ${outPath}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
