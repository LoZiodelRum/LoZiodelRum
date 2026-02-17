/**
 * Upload file su Supabase Storage (bucket 'images').
 * Usa supabase.storage.from('images').upload() e getPublicUrl().
 */
import { supabase, isSupabaseConfigured } from "./supabase";

const BUCKET = "images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB

function getFileType(file) {
  return (file.type || "").startsWith("video/") ? "video" : "image";
}

/**
 * Carica un file nello storage e restituisce l'URL pubblico.
 * Nome univoco: Date.now()_nomefile
 */
export async function uploadToSupabaseStorage(file, folder, type = "image") {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase non configurato per upload. Verifica VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
  }
  const fileType = (type === "video" || type === "image") ? type : getFileType(file);
  const maxSize = fileType === "video" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    const maxMB = maxSize / (1024 * 1024);
    throw new Error(`File troppo grande. Max ${maxMB}MB per ${fileType === "video" ? "video" : "immagini"}.`);
  }
  const ext = file.name.split(".").pop() || (fileType === "video" ? "mp4" : "jpg");
  const safeName = (file.name || "").replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 50);
  const path = `${folder}/${Date.now()}_${safeName || Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    console.error("[Supabase] storage upload - errore completo:", {
      error,
      message: error.message,
      statusCode: error.statusCode,
      errorDetails: error.error,
      name: error.name,
      hint: "Se statusCode 403 o 'new row violates row-level security', verifica RLS sul bucket 'images' in Supabase Dashboard → Storage → images → Policies",
    });
    throw new Error(error.message || "Errore caricamento file");
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Carica più file e restituisce array di URL.
 * @param {File[]} files - Array di file
 * @param {string} folder - Cartella
 * @param {Function} onProgress - (index, total, url) => void
 * @returns {Promise<string[]>} Array di URL pubblici
 */
export async function uploadMultipleToSupabaseStorage(files, folder, onProgress) {
  if (!files?.length) return [];
  const urls = [];
  for (let i = 0; i < files.length; i++) {
    const type = getFileType(files[i]);
    const url = await uploadToSupabaseStorage(files[i], folder, type);
    urls.push(url);
    onProgress?.(i + 1, files.length, url);
  }
  return urls;
}

/** Converte array di URL in stringa separata da virgole (per DB) */
export function urlsToDbString(urls) {
  return Array.isArray(urls) ? urls.filter(Boolean).join(",") : "";
}

/** Converte stringa DB in array di URL */
export function dbStringToUrls(str) {
  if (!str || typeof str !== "string") return [];
  return str.split(",").map((s) => s.trim()).filter(Boolean);
}

/**
 * Estrae bucket e path da un URL pubblico Supabase.
 * Es: .../public/images/bartenders/123.jpg → { bucket: "images", path: "bartenders/123.jpg" }
 */
export function extractStoragePathFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  return match ? { bucket: match[1], path: match[2] } : null;
}

/**
 * Rimuove uno o più file dal bucket 'images' (e da 'media' per retrocompatibilità).
 * @param {string|string[]} urlOrUrls - URL pubblico o array di URL separati da virgola
 * @returns {Promise<{ removed: string[], errors: string[] }>}
 */
export async function removeFromImagesStorage(urlOrUrls) {
  if (!isSupabaseConfigured() || !supabase) return { removed: [], errors: [] };
  const urls = Array.isArray(urlOrUrls)
    ? urlOrUrls
    : typeof urlOrUrls === "string"
      ? urlOrUrls.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
  const byBucket = {};
  for (const u of urls) {
    const parsed = extractStoragePathFromUrl(u);
    if (parsed && ["images", "media"].includes(parsed.bucket)) {
      if (!byBucket[parsed.bucket]) byBucket[parsed.bucket] = [];
      byBucket[parsed.bucket].push(parsed.path);
    }
  }
  const removed = [];
  const errors = [];
  for (const [bucket, paths] of Object.entries(byBucket)) {
    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) {
      console.error("[Supabase] storage remove - errore:", { error, message: error.message, bucket, paths });
      errors.push(error.message);
    } else {
      removed.push(...paths);
    }
  }
  return { removed, errors };
}
